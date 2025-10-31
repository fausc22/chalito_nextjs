# El Chalito - Sistema de Gestión Gastronómica (Next.js)

Sistema de gestión gastronómica desarrollado con Next.js 15, React 18 y Tailwind CSS.

## Características

- ✅ Next.js 15 con Pages Router
- ✅ React 18
- ✅ Tailwind CSS con configuración personalizada
- ✅ Autenticación JWT
- ✅ Diseño responsivo para todos los dispositivos
- ✅ PWA (Progressive Web App)
- ✅ TypeScript-ready
- ✅ ESLint configurado

## Requisitos

- Node.js 16 o superior
- npm 8 o superior

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con la URL de tu backend
```

## Scripts disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Lint
npm run lint
```

## Estructura del proyecto

```
front-next/
├── pages/                 # Páginas de Next.js (Pages Router)
│   ├── _app.js           # App wrapper
│   ├── _document.js      # Document personalizado
│   ├── index.js          # Página de inicio
│   ├── login.js          # Página de login
│   └── dashboard.js      # Dashboard principal
├── src/
│   ├── components/       # Componentes React reutilizables
│   │   ├── auth/        # Componentes de autenticación
│   │   ├── common/      # Componentes comunes
│   │   └── layout/      # Componentes de layout
│   ├── contexts/        # React Contexts
│   ├── hooks/           # Custom React Hooks
│   ├── services/        # Servicios y API clients
│   ├── config/          # Archivos de configuración
│   ├── utils/           # Utilidades
│   └── styles/          # Estilos globales
├── public/              # Archivos estáticos
└── next.config.js       # Configuración de Next.js
```

## Configuración de Tailwind CSS

El proyecto incluye una configuración global de Tailwind CSS con:

- Paleta de colores personalizada para El Chalito
- Componentes reutilizables (botones, cards, inputs)
- Animaciones personalizadas
- Clases utilitarias para responsividad
- Scrollbar personalizada

## Autenticación

El sistema utiliza JWT con refresh tokens:

- Access Token: 15 minutos
- Refresh Token: 7 días
- Renovación automática de tokens
- Redirección automática al expirar sesión

## Responsividad

Todos los componentes están diseñados para ser completamente responsivos:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=El Chalito
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Despliegue

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Otros servicios

1. Build del proyecto: `npm run build`
2. Subir la carpeta `.next` y `public`
3. Configurar variables de entorno
4. Iniciar con: `npm start`

## Licencia

© El Chalito 2025. Todos los derechos reservados.
