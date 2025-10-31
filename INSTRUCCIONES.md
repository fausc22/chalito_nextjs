# Instrucciones de Instalación y Ejecución - El Chalito Next.js

## Proyecto Creado Exitosamente ✅

Se ha migrado el proyecto React original a **Next.js 15** con **Pages Router**, usando **JavaScript puro** y **Tailwind CSS** para estilos globales.

---

## 📁 Estructura del Proyecto

```
front-next/
├── pages/                      # Páginas de Next.js (Pages Router)
│   ├── _app.js                # Configuración global de la app
│   ├── _document.js           # Document HTML personalizado
│   ├── index.js               # Página principal (redirige según autenticación)
│   ├── login.js               # Página de inicio de sesión
│   ├── dashboard.js           # Dashboard principal
│   └── 404.js                 # Página de error 404
│
├── src/
│   ├── components/
│   │   ├── auth/              # Componentes de autenticación
│   │   │   ├── LoginForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Layout.jsx
│   │   │   ├── NavBar.jsx
│   │   │   └── Footer.jsx
│   │   └── common/            # Componentes reutilizables
│   │
│   ├── contexts/              # React Contexts
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useLocalStorage.js
│   │   └── useMediaQuery.js
│   │
│   ├── services/              # Servicios API
│   │   ├── api.js             # Cliente Axios configurado
│   │   └── authService.js     # Servicio de autenticación
│   │
│   ├── config/                # Configuración
│   │   ├── api.js             # URLs y configuración de API
│   │   └── routes.js          # Rutas de la aplicación
│   │
│   ├── utils/                 # Utilidades
│   │   ├── formatters.js      # Formateadores de datos
│   │   └── validators.js      # Validadores
│   │
│   └── styles/
│       └── globals.css        # Estilos globales con Tailwind
│
├── public/                    # Archivos estáticos
│   ├── logo-empresa.png
│   ├── manifest.json          # PWA manifest
│   └── robots.txt
│
├── .env.local                 # Variables de entorno
├── next.config.js             # Configuración de Next.js
├── tailwind.config.js         # Configuración de Tailwind CSS
├── postcss.config.js          # Configuración de PostCSS
└── package.json               # Dependencias del proyecto
```

---

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd front-next
npm install
```

### 2. Configurar Variables de Entorno

El archivo `.env.local` ya está creado con la configuración básica:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=El Chalito
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**IMPORTANTE:** Asegúrate de que la URL del backend coincida con el puerto donde corre tu servidor Express.

Según el archivo `back/server.js`, el backend está configurado para correr en el puerto que tengas en tu `.env` del backend. Verifica que sea `3001`.

---

## ▶️ Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Modo Producción

```bash
# 1. Crear build de producción
npm run build

# 2. Iniciar servidor de producción
npm start
```

---

## 🔧 Compatibilidad con Backend

### Configuración del Backend

El backend debe estar corriendo en el puerto **3001** (o el que configures en `.env.local`).

El backend actual en `back/server.js` tiene configurado CORS para permitir `localhost:3000`:

```javascript
const allowedOrigins = [
    'http://localhost:3000', // ✅ Ya configurado para Next.js
];
```

### Endpoints Necesarios

El proyecto espera que el backend tenga los siguientes endpoints:

**Autenticación:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh-token` - Renovar access token
- `GET /auth/verify` - Verificar token actual
- `GET /auth/profile` - Obtener perfil del usuario

### Estructura de Respuestas

**Login exitoso:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "nombre": "Usuario",
    "usuario": "username",
    "email": "email@example.com",
    "rol": "ADMIN"
  }
}
```

**Verificación de token:**
```json
{
  "user": {
    "id": 1,
    "nombre": "Usuario",
    "usuario": "username",
    "email": "email@example.com",
    "rol": "ADMIN"
  }
}
```

---

## 🎨 Tailwind CSS - Configuración Global

El proyecto usa Tailwind CSS con **configuración global** para mantener consistencia en todo el sistema.

### Clases Utilitarias Disponibles

**Botones:**
```jsx
<button className="btn-primary">Botón primario</button>
<button className="btn-secondary">Botón secundario</button>
<button className="btn-danger">Botón peligro</button>
<button className="btn-outline">Botón outline</button>
<button className="btn-ghost">Botón ghost</button>

// Tamaños
<button className="btn-primary btn-sm">Pequeño</button>
<button className="btn-primary btn-lg">Grande</button>
```

**Cards:**
```jsx
<div className="card">Contenido</div>
<div className="card-hover">Card con hover effect</div>
```

**Inputs:**
```jsx
<label className="label">Etiqueta</label>
<input className="input" />
<input className="input input-error" /> // Con error
<p className="error-message">Mensaje de error</p>
```

**Badges:**
```jsx
<span className="badge-primary">Badge</span>
<span className="badge-secondary">Badge</span>
<span className="badge-danger">Badge</span>
<span className="badge-success">Badge</span>
<span className="badge-warning">Badge</span>
```

**Spinners:**
```jsx
<div className="spinner"></div>
<div className="spinner spinner-sm"></div>
<div className="spinner spinner-lg"></div>
```

**Animaciones:**
```jsx
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-up">Slide up</div>
<div className="animate-slide-down">Slide down</div>
<div className="animate-bounce-in">Bounce in</div>
```

**Containers:**
```jsx
<div className="container-custom">Contenedor responsivo</div>
<main className="main-content">Contenido principal</main>
<div className="page-layout">Layout de página</div>
```

---

## 📱 Responsive Design

El proyecto está completamente optimizado para todos los dispositivos:

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (xl, 2xl)

### Breakpoints de Tailwind

```jsx
// Ocultar en móvil, mostrar en tablet+
<div className="hidden md:block">Contenido</div>

// Mostrar solo en móvil
<div className="block md:hidden">Contenido</div>

// Responsive con diferentes tamaños
<div className="text-sm md:text-base lg:text-lg">Texto</div>
```

---

## 🔐 Autenticación

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Se envía request a `/auth/login`
3. Backend retorna `accessToken`, `refreshToken` y datos del usuario
4. Tokens se guardan en `localStorage`
5. Se redirige al usuario a `/dashboard`
6. En cada request, se envía el `accessToken` en el header `Authorization: Bearer {token}`
7. Si el token expira (401), se intenta renovar con el `refreshToken`
8. Si falla la renovación, se redirige a `/login`

### Rutas Protegidas

Todas las páginas excepto `/login` están protegidas. Para agregar una nueva página protegida:

```jsx
// pages/nueva-pagina.js
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute';
import { Layout } from '../src/components/layout/Layout';

function NuevaPaginaContent() {
  return (
    <Layout title="Nueva Página">
      <div className="main-content">
        {/* Contenido */}
      </div>
    </Layout>
  );
}

export default function NuevaPagina() {
  return (
    <ProtectedRoute>
      <NuevaPaginaContent />
    </ProtectedRoute>
  );
}
```

### Protección por Roles

```jsx
import { ROLES } from '../src/config/api';

<ProtectedRoute requiredRole={ROLES.ADMIN}>
  <ContenidoSoloAdmin />
</ProtectedRoute>
```

---

## 🧩 Componentes Principales

### Layout

El componente `Layout` incluye NavBar, Footer y manejo de título:

```jsx
import { Layout } from '../src/components/layout/Layout';

<Layout title="Título de la página" description="Descripción">
  {children}
</Layout>
```

### NavBar

Barra de navegación responsiva con:
- Logo
- Enlaces de navegación
- Información del usuario
- Botón de logout
- Menú hamburguesa en móvil

### LoginForm

Formulario de login con:
- Validación de campos
- Mostrar/ocultar contraseña
- Recordar sesión
- Manejo de errores
- Credenciales de prueba en desarrollo

---

## 📊 Hooks Personalizados

### useLocalStorage

```jsx
import { useLocalStorage } from '../src/hooks/useLocalStorage';

const [value, setValue] = useLocalStorage('key', defaultValue);
```

### useMediaQuery

```jsx
import { useIsMobile, useIsTablet, useIsDesktop } from '../src/hooks/useMediaQuery';

const isMobile = useIsMobile();
const isTablet = useIsTablet();
const isDesktop = useIsDesktop();
```

---

## 🛠️ Utilidades

### Formatters

```jsx
import { formatCurrency, formatDate, formatDateTime } from '../src/utils/formatters';

formatCurrency(1000); // "$1.000,00"
formatDate(new Date()); // "30 de octubre de 2025"
formatDateTime(new Date()); // "30 de octubre de 2025, 18:30"
```

### Validators

```jsx
import { isValidEmail, isValidPhone, isRequired } from '../src/utils/validators';

isValidEmail('test@example.com'); // true
isValidPhone('+5491123456789'); // true
isRequired('valor'); // true
```

---

## 🐛 Solución de Problemas

### Error: CORS

Si tienes errores de CORS, verifica que el backend permita `localhost:3000`:

```javascript
// back/server.js
const allowedOrigins = [
    'http://localhost:3000',
];
```

### Error: Cannot connect to backend

Verifica que:
1. El backend esté corriendo en el puerto correcto (3001)
2. La variable `NEXT_PUBLIC_API_URL` en `.env.local` apunte al puerto correcto
3. El backend tenga los endpoints necesarios

### Página en blanco después del login

Abre la consola del navegador (F12) y verifica:
1. Que no haya errores de JavaScript
2. Que el token se haya guardado en `localStorage`
3. Que la respuesta del backend sea correcta

---

## 📝 Próximos Pasos

Para agregar los módulos de Pedidos, Ventas, Artículos, etc:

1. Crear la página en `pages/` (ej: `pages/pedidos.js`)
2. Crear los componentes en `src/components/`
3. Agregar los servicios en `src/services/`
4. Agregar las rutas en `src/config/routes.js`
5. Agregar los endpoints en `src/config/api.js`

---

## ✅ Checklist de Verificación

- [x] Next.js 15 configurado con Pages Router
- [x] Tailwind CSS con configuración global
- [x] Sistema de autenticación JWT
- [x] Diseño 100% responsivo
- [x] Componentes reutilizables
- [x] Hooks personalizados
- [x] Utilidades y validadores
- [x] Configuración de API
- [x] Manejo de errores
- [x] Notificaciones (react-hot-toast)
- [x] PWA ready

---

## 🎯 Comandos Rápidos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Lint
npm run lint
```

---

## 📞 Soporte

Para cualquier problema o duda, revisa:
1. Este archivo (INSTRUCCIONES.md)
2. README.md
3. Documentación de Next.js: https://nextjs.org/docs
4. Documentación de Tailwind CSS: https://tailwindcss.com/docs

---

**¡El proyecto está listo para usar! 🎉**
