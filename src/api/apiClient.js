const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const buildUrl = (path) => {
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const error = new Error('HTTP error');
    error.response = { status: res.status, data };
    throw error;
  }
  return { status: res.status, data };
};

const apiClient = {
  get: async (url) => {
    const res = await fetch(buildUrl(url), { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },
  post: async (url, data = {}) => {
    const res = await fetch(buildUrl(url), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  put: async (url, data = {}) => {
    const res = await fetch(buildUrl(url), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  delete: async (url) => {
    const res = await fetch(buildUrl(url), { method: 'DELETE', headers: getHeaders() });
    return handleResponse(res);
  }
};

export default apiClient;
