# 🚀 Configuración de Deployment

## Variables de Entorno para Vercel

### Backend (.env en Vercel Dashboard)
```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lanus-juveniles?retryWrites=true&w=majority
CORS_ORIGIN=https://tu-frontend-url.vercel.app
JWT_SECRET=tu-super-secret-jwt-key-para-produccion
MAX_FILE_SIZE=5mb
```

### Frontend (.env en Vercel Dashboard)
```
REACT_APP_API_URL=https://tu-backend-url.vercel.app/api
REACT_APP_NAME=Lanús Juveniles
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_LIVE_UPDATES=true
REACT_APP_REFRESH_INTERVAL=30000
```

## Pasos para MongoDB Atlas

1. Ir a https://cloud.mongodb.com/
2. Crear cuenta gratuita
3. Crear nuevo cluster (M0 Sandbox - GRATIS)
4. Configurar usuario y contraseña
5. Permitir acceso desde cualquier IP (0.0.0.0/0)
6. Obtener connection string
7. Reemplazar en MONGO_URI

## Pasos para Vercel

### Backend:
1. Ir a https://vercel.com/
2. Conectar con GitHub
3. Importar repositorio
4. Configurar como "Other" framework
5. Root Directory: `backend`
6. Build Command: `npm run build`
7. Output Directory: `src`
8. Install Command: `npm install`

### Frontend:
1. Nuevo proyecto en Vercel
2. Importar mismo repositorio
3. Framework: React
4. Root Directory: `frontend`
5. Build Command: `npm run build`
6. Output Directory: `build`
7. Install Command: `npm install`

## URLs Finales
- Frontend: https://lanus-juveniles-frontend.vercel.app
- Backend: https://lanus-juveniles-backend.vercel.app
- API: https://lanus-juveniles-backend.vercel.app/api

## Comandos para Poblar Base de Datos
Una vez deployado el backend, ejecutar:
```bash
# Localmente, apuntando a la base de datos de producción
MONGO_URI="tu-mongo-atlas-uri" npm run seed
```
