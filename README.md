# Plataforma de Domicilios PWA

Plataforma completa de domicilios con 4 paneles: Cliente, Repartidor, Negocio y Admin.

## Stack

- **Backend**: Node.js + Express + MySQL 8 + Sequelize + Socket.io
- **Frontend**: React + Vite + Tailwind CSS + Zustand

## Estructura

```
/backend
  /src
    /controllers    # Lógica de negocio
    /routes         # Endpoints REST
    /middlewares    # Auth, errores
    /models         # Modelos Sequelize
    /sockets        # Socket.io handlers
    /services       # Servicios externos (Mercado Pago, FCM)
  package.json
  Dockerfile

/frontend
  /src
    /pages          # Vistas por rol
    /components     # Componentes reutilizables
    /services       # API clients
    /store          # Zustand stores
    App.jsx
  vite.config.js
  tailwind.config.js
```

## Desarrollo

### Backend
```bash
cd backend
npm install
# Configurar .env con credenciales MySQL y JWT
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d
```

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Perfil
- `POST /api/v1/auth/refresh` - Refresh token
- `PATCH /api/v1/auth/fcm-token` - Registrar FCM token

### Negocios
- `GET /api/v1/businesses` - Lista negocios
- `GET /api/v1/businesses/:id` - Detalle negocio + productos

### Pedidos
- `POST /api/v1/orders` - Crear pedido (cliente)
- `GET /api/v1/orders/me` - Mis pedidos (cliente)
- `PATCH /api/v1/orders/:id/accept` - Aceptar pedido (negocio)

## Credenciales de Desarrollo

- admin@domiapp.co / Domi12345
- camila@cliente.co / Domi12345
- andres@rider.co / Domi12345
- elfogon@negocio.co / Domi12345