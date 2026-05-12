# SmartLogix - Frontend

Interfaz web de la plataforma de logística eCommerce SmartLogix.

## Integrantes
- Gabriela Saldivar
- Corina Roa

## Tecnologías
- React 18 + Vite
- Bootstrap 5
- React Router DOM v6
- React Toastify

## Vistas
| Ruta | Vista | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Pública |
| `/registro` | Registro de usuario | Pública |
| `/admin` | Panel de administración | Solo ADMIN |
| `/inventario` | Gestión de inventario | Autenticado |

## Requisitos
- Node.js 18+
- BFF (API Gateway) corriendo en `localhost:9090`

## Instalación y ejecución
```bash
npm install
npm run dev
```

Disponible en: `http://localhost:5173`

## Credenciales admin
- Email: `admin@smartlogix.cl`
- Password: `admin123`
