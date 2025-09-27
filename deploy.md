# 🚀 Guía de Deployment - Lanús Juveniles

## ✅ **OPCIÓN RECOMENDADA: Vercel + MongoDB Atlas**

### **PASO 1: Configurar MongoDB Atlas (5 minutos)**

1. **Crear cuenta en MongoDB Atlas**
   - Ir a: https://cloud.mongodb.com/
   - Registrarse gratis
   - Crear organización y proyecto

2. **Crear cluster gratuito**
   - Elegir "M0 Sandbox" (GRATIS)
   - Región: cualquiera cercana
   - Nombre: `lanus-juveniles`

3. **Configurar acceso**
   - Database Access → Add New Database User
   - Username: `lanus-admin`
   - Password: generar automáticamente (guardar)
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

4. **Obtener connection string**
   - Connect → Connect your application
   - Copiar la URI (reemplazar `<password>` con tu password)

### **PASO 2: Deployment en Vercel (10 minutos)**

#### **2A. Backend**
1. **Ir a Vercel**
   - https://vercel.com/
   - Registrarse con GitHub

2. **Importar proyecto**
   - New Project → Import Git Repository
   - Conectar tu repositorio de GitHub
   - Framework Preset: "Other"
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Output Directory: `src`

3. **Configurar variables de entorno**
   - Settings → Environment Variables
   - Agregar:
     ```
     NODE_ENV=production
     MONGO_URI=tu-connection-string-de-atlas
     CORS_ORIGIN=*
     PORT=4000
     ```

4. **Deploy**
   - Hacer deploy
   - Obtener URL del backend (ej: `https://lanus-backend-xxx.vercel.app`)

#### **2B. Frontend**
1. **Nuevo proyecto en Vercel**
   - New Project
   - Mismo repositorio
   - Framework Preset: "Create React App"
   - Root Directory: `frontend`

2. **Configurar variables de entorno**
   - Settings → Environment Variables
   - Agregar:
     ```
     REACT_APP_API_URL=https://tu-backend-url.vercel.app/api
     REACT_APP_NAME=Lanús Juveniles
     ```

3. **Deploy**
   - Hacer deploy
   - Obtener URL del frontend (ej: `https://lanus-frontend-xxx.vercel.app`)

### **PASO 3: Poblar Base de Datos**

1. **Actualizar CORS en backend**
   - En Vercel, ir a tu backend
   - Environment Variables
   - Actualizar `CORS_ORIGIN` con la URL real del frontend

2. **Poblar datos**
   - Localmente, ejecutar:
   ```bash
   cd backend
   MONGO_URI="tu-atlas-uri" npm run seed
   ```

### **PASO 4: Verificar Funcionamiento**

1. **Probar backend**
   - Ir a: `https://tu-backend-url.vercel.app`
   - Debería mostrar JSON con información de la API

2. **Probar frontend**
   - Ir a: `https://tu-frontend-url.vercel.app`
   - Navegar por las secciones
   - Verificar que los datos se cargan

## 🎯 **URLs Finales**
- **Demo Frontend**: `https://tu-frontend-url.vercel.app`
- **API Backend**: `https://tu-backend-url.vercel.app/api`

## 🔧 **Troubleshooting**

### Si el backend no conecta a MongoDB:
- Verificar que la IP 0.0.0.0/0 esté permitida en Atlas
- Verificar que el usuario de base de datos tenga permisos
- Verificar que el connection string sea correcto

### Si el frontend no carga datos:
- Verificar que REACT_APP_API_URL apunte al backend correcto
- Verificar CORS en el backend
- Revisar logs en Vercel Dashboard

## 💡 **Ventajas de esta configuración**
- ✅ Completamente gratuito
- ✅ URLs profesionales
- ✅ SSL automático (HTTPS)
- ✅ Deploy automático con Git
- ✅ Escalable si necesitas upgrade
- ✅ Perfecto para demos y presentaciones

## 🚀 **¿Necesitas ayuda?**
Si tienes algún problema durante el deployment, comparte:
1. Los logs de error
2. Las URLs que obtuviste
3. El paso donde te quedaste

¡Tu aplicación de Lanús Juveniles estará online en menos de 20 minutos! ⚽🏆
