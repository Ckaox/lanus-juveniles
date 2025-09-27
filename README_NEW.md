# 🏆 Lanús Juveniles Web App

Una aplicación web completa para gestionar y visualizar información de las divisiones inferiores del Club Atlético Lanús (4ta a 9na división).

## 📋 Características Principales

### ✅ Funcionalidades Implementadas
- 🏠 **Dashboard principal** con resumen de actividades
- 👥 **Gestión de equipos** por categoría con planteles completos
- ⚽ **Sistema de partidos** con resultados y seguimiento
- 🔴 **Partidos en vivo** con actualización en tiempo real
- 📊 **Estadísticas detalladas** de jugadores y equipos
- 🏆 **Tablas de posiciones** por categoría
- 📱 **Diseño responsive** para móviles y escritorio
- 🎯 **Tabla de goleadores** y estadísticas individuales

### 🎨 Tecnologías Utilizadas
- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Estilos**: CSS3 con diseño responsive
- **Base de datos**: MongoDB con esquemas optimizados

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (local o remoto)
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd lanus-juveniles
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

#### Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
# PORT=4000
# MONGO_URI=mongodb://localhost:27017/lanus-juveniles
# CORS_ORIGIN=http://localhost:3000
```

#### Poblar base de datos con datos de ejemplo
```bash
npm run seed
```

#### Iniciar servidor backend
```bash
npm run dev
```
El backend estará disponible en `http://localhost:4000`

### 3. Configurar Frontend
```bash
cd frontend
npm install
```

#### Configurar variables de entorno (opcional)
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# La configuración por defecto debería funcionar
# REACT_APP_API_URL=http://localhost:4000/api
```

#### Iniciar aplicación frontend
```bash
npm start
```
La aplicación estará disponible en `http://localhost:3000`

## 📖 Estructura del Proyecto

```
lanus-juveniles/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/         # Esquemas de MongoDB
│   │   ├── routes/         # Rutas de la API
│   │   ├── scripts/        # Scripts utilitarios
│   │   └── index.js        # Punto de entrada
│   ├── .env.example        # Variables de entorno ejemplo
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   └── App.js         # Componente principal
│   ├── .env.example       # Variables de entorno ejemplo
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades por Sección

### 🏠 Dashboard Principal
- Resumen de partidos en vivo
- Últimos resultados
- Próximos partidos
- Accesos rápidos a secciones

### 👥 Equipos
- Vista por categorías (4ta a 9na división)
- Planteles completos con información de jugadores
- Estadísticas de equipos
- Historial de partidos

### ⚽ Partidos
- Lista completa de partidos con filtros
- Detalle de cada partido con eventos
- Resultados históricos
- Programación futura

### 🔴 En Vivo
- Seguimiento en tiempo real
- Actualización automática cada 30 segundos
- Eventos del partido (goles, tarjetas)
- Estadísticas en vivo

### 📊 Estadísticas
- Estadísticas de jugadores individuales
- Rendimiento de equipos
- Tabla de goleadores
- Comparativas por categoría

### 🏆 Tablas de Posiciones
- Clasificaciones por categoría
- Tabla de forma (últimos 5 partidos)
- Estadísticas detalladas
- Indicadores de clasificación/descenso

## 🔧 API Endpoints

### Equipos
- `GET /api/teams` - Listar equipos
- `GET /api/teams/:id` - Obtener equipo específico
- `GET /api/teams/category/:category` - Equipos por categoría
- `GET /api/teams/category/:category/standings` - Tabla de posiciones

### Jugadores
- `GET /api/players` - Listar jugadores
- `GET /api/players/:id` - Obtener jugador específico
- `GET /api/players/team/:teamId` - Jugadores por equipo

### Partidos
- `GET /api/matches` - Listar partidos
- `GET /api/matches/live` - Partidos en vivo
- `GET /api/matches/:id` - Obtener partido específico
- `GET /api/matches/:id/events` - Eventos del partido

## 🎨 Diseño y UX

### Colores Principales
- **Granate**: #800000 (Color principal del club)
- **Blanco**: #FFFFFF (Color secundario)
- **Grises**: Diversos tonos para texto y fondos

### Características de Diseño
- Diseño responsive con mobile-first
- Navegación intuitiva con breadcrumbs
- Indicadores visuales para estados (en vivo, finalizado, etc.)
- Animaciones suaves y transiciones
- Iconografía clara y consistente

## 🚀 Despliegue

### Backend
1. Configurar variables de entorno para producción
2. Usar `npm start` para modo producción
3. Configurar MongoDB Atlas o servidor MongoDB
4. Configurar CORS para dominio de producción

### Frontend
1. Ejecutar `npm run build` para crear build de producción
2. Servir archivos estáticos desde servidor web
3. Configurar variables de entorno para API de producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo de Desarrollo

Desarrollado para las divisiones inferiores del Club Atlético Lanús.

---

**¡Vamos Granate! 🔴⚪**
