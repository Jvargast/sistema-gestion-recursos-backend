# ERP AguasValentino – Backend

Backend del sistema ERP de AguasValentino. Provee APIs REST y WebSockets para gestionar clientes, ventas, inventario, logística y reporting.

## ⚙️ Stack tecnológico

- **Node.js** (v18/20)
- **Express** como framework HTTP
- **Sequelize** como ORM
- **PostgreSQL** (RDS en producción)
- **JWT** para autenticación
- **Socket.IO** para eventos en tiempo real
- **Docker + Docker Compose** para despliegue

## 🏗️ Arquitectura general

- API REST bajo el prefijo: `/api`
- Módulos principales:
  - `auth` – login, permisos, manejo de sesiones
  - `ventas` – creación de ventas, documentos, cobros
  - `inventario` – productos, inventario de bodega y camión
  - `logistica` – agenda de viajes, entregas, retornos
  - `reportes` – estadísticas diarias y consolidadas
- Integrado con el frontend React (S3 + CloudFront) mediante `VITE_API_URL`.

## 🔐 Variables de entorno principales

El backend utiliza un archivo `.env` / `.env.prod` (no versionado). Variables típicas:

```env
NODE_ENV=production
PORT=8080

DB_HOST=xxxxxxxx.xxxx.xxxxxxx.xxxx
DB_PORT=xxxx
DB_NAME=aguasvalentino
DB_USER=xxxx
DB_PASSWORD=xxxx

JWT_SECRET=xxxxxxxxxxxx
JWT_EXPIRES_IN=1d

CORS_ORIGIN=https://erp.aguasvalentino.com
COOKIE_DOMAIN=.aguasvalentino.com
```

## 🧪 Scripts principales

```bash
# Desarrollo
npm run dev

# Producción local
npm run start
```

## 🐳 Despliegue con Docker Compose

```bash
git pull origin master
docker-compose build backend
docker-compose up -d backend
```
