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

## Arquitectura

```
Frontend (puerto 5173)
        ↓
BFF / API Gateway (puerto 9090)
        ↓
  Microservicios Backend
```
La comunicación con el backend se realiza a través de `src/api/apiClient.js`, que agrega automáticamente el token JWT en cada petición.

## Vistas
| Ruta | Vista | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Pública |
| `/registro` | Registro de usuario | Pública |
| `/admin` | Panel de administración | Solo ADMIN |
| `/inventario` | Gestión de inventario | Autenticado |

## Autenticación

El sistema usa **JWT**. Al iniciar sesión, el token se guarda en `localStorage` y se envía automáticamente en cada petición al backend mediante el header:

```
Authorization: Bearer <token>
```

## Requisitos
- Node.js 18+
- BFF (API Gateway) corriendo en `localhost:9090`

## Instalación y ejecución
```bash  
git clone https://github.com/cori-roa/Smartlogix-frontend-Saldivar-Roa.git  
cd Smartlogix-frontend-Saldivar-Roa
npm install
npm run dev
```

Disponible en: `http://localhost:5173`

## Credenciales admin
- Email: `admin@smartlogix.cl`
- Password: `admin123`
