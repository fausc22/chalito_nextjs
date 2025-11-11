# Frontend - Sistema El Chalito 🍔

Sistema de gestión gastronómica desarrollado con Next.js, React y Tailwind CSS.

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── components/         # Componentes reutilizables
│   ├── common/        # Componentes UI base
│   ├── articulos/     # Componentes de artículos
│   ├── dashboard/     # Componentes de dashboard
│   ├── auth/          # Componentes de autenticación
│   └── layout/        # Componentes de layout
│
├── hooks/             # Hooks personalizados
├── contexts/          # Contextos de React
├── services/          # Servicios y API
├── config/            # Configuración
├── utils/             # Utilidades
├── styles/            # Estilos globales
│
├── pages/             # Páginas de Next.js (todas .jsx)
│   ├── _app.jsx
│   ├── index.jsx
│   ├── login.jsx
│   ├── dashboard.jsx
│   └── articulos.jsx
│
└── public/            # Archivos estáticos
```

> 📚 Ver [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) para más detalles

---

## 🎨 Tecnologías

- **Framework**: [Next.js 13](https://nextjs.org/)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📦 Componentes Reutilizables

### Componentes UI Base
- `Button` - Botones con variantes
- `Card` - Tarjetas contenedoras
- `Input`, `Textarea`, `Select`, `Checkbox` - Formularios
- `Modal` - Modales y diálogos
- `Badge` - Etiquetas y estados
- `StatsCard` - Tarjetas de estadísticas

### Componentes Específicos
- **Artículos**: Filtros, Tabla, Formulario, Estadísticas
- **Dashboard**: ModuleCard, WelcomeCard, StatusCard
- **Auth**: LoginForm, ProtectedRoute
- **Layout**: NavBar, Footer, Layout

> 📚 Ver [COMPONENTES_GUIA.md](./COMPONENTES_GUIA.md) para guía completa

---

## 🎣 Hooks Personalizados

- `useModal` - Gestión de modales
- `useForm` - Formularios con validación
- `useToggle` - Estados booleanos
- `useAsync` - Operaciones asíncronas
- `useArticulos` - Gestión de artículos
- `useDebounce` - Debounce de valores
- `useLocalStorage` - Persistencia en localStorage
- `useMediaQuery` - Media queries responsive

---

## 🌐 Contextos

### AuthContext
Maneja la autenticación y sesión del usuario.

```jsx
import { useAuth } from '../contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### NotificationContext
Sistema de notificaciones.

```jsx
import { useNotification } from '../contexts/NotificationContext';

const { showSuccess, showError, showInfo } = useNotification();
```

---

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=El Chalito
```

### Configuración de API

Archivo: `config/api.js`

```javascript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

---

## 📝 Convenciones de Código

### Nombres de Archivos
- **Componentes**: PascalCase + `.jsx` (Ej: `Button.jsx`)
- **Hooks**: camelCase + `.jsx` (Ej: `useModal.jsx`)
- **Páginas**: camelCase + `.jsx` (Ej: `login.jsx`)
- **Servicios**: camelCase + `.js` (Ej: `authService.js`)
- **Configuración**: camelCase + `.js` (Ej: `api.js`)

### Imports
```jsx
// 1. Dependencias externas
import React, { useState } from 'react';
import { useRouter } from 'next/router';

// 2. Componentes
import { Button, Card } from '../components/common';

// 3. Hooks
import useArticulos from '../hooks/useArticulos';

// 4. Contextos
import { useAuth } from '../contexts/AuthContext';

// 5. Servicios/Utils
import { formatPrice } from '../utils/formatters';
```

---

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm start            # Inicia servidor de producción

# Linting
npm run lint         # Ejecuta ESLint

# Formato
npm run format       # Formatea código (si está configurado)
```

---

## 🏗️ Crear Nuevos Componentes

### 1. Componente Simple

```jsx
// components/common/MiComponente.jsx
export const MiComponente = ({ title, onClick }) => {
  return (
    <button onClick={onClick} className="btn-primary">
      {title}
    </button>
  );
};
```

### 2. Componente con Hook

```jsx
// components/mimodulo/MiComponente.jsx
import { useState } from 'react';
import { Button } from '../common/Button';

export const MiComponente = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Contador: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Incrementar
      </Button>
    </div>
  );
};
```

### 3. Página de Next.js

```jsx
// pages/mipagina.jsx
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function MiPaginaContent() {
  return (
    <Layout title="Mi Página">
      <div className="main-content">
        <h1>Mi Página</h1>
      </div>
    </Layout>
  );
}

export default function MiPagina() {
  return (
    <ProtectedRoute>
      <MiPaginaContent />
    </ProtectedRoute>
  );
}
```

---

## 🎨 Sistema de Diseño

### Colores

```css
/* Primarios */
primary-500, primary-600, primary-700

/* Semánticos */
success-500  /* Verde - Éxito */
danger-500   /* Rojo - Error */
warning-500  /* Amarillo - Advertencia */
info-500     /* Azul - Información */

/* Neutrales */
gray-50, gray-100, ..., gray-900
```

### Clases Personalizadas

```css
/* Botones */
.btn-primary, .btn-secondary, .btn-outline
.btn-danger, .btn-success

/* Tarjetas */
.card

/* Badges */
.badge-primary, .badge-success, .badge-danger

/* Inputs */
.input, .label
```

---

## 📱 Responsividad

Todos los componentes son responsive por defecto usando breakpoints de Tailwind:

```jsx
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

---

## 🔐 Autenticación

### Rutas Protegidas

```jsx
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export default function MiPagina() {
  return (
    <ProtectedRoute>
      {/* Contenido solo para usuarios autenticados */}
    </ProtectedRoute>
  );
}
```

### Verificación de Rol

```jsx
const { user, isAdmin, hasRole } = useAuth();

if (isAdmin()) {
  // Acciones de administrador
}

if (hasRole('GERENTE')) {
  // Acciones de gerente
}
```

---

## 🐛 Troubleshooting

### Puerto en uso
```bash
Error: Port 3000 is already in use
```
**Solución**: Cambiar puerto o matar el proceso
```bash
npm run dev -- -p 3001
```

### Imports no encontrados
```bash
Module not found: Can't resolve '../src/...'
```
**Solución**: Actualizar imports (ya no existe `src/`)
```jsx
// Antes
import { Button } from '../src/components/common/Button';

// Ahora
import { Button } from '../components/common/Button';
```

### Errores de Tailwind
```bash
The className ... doesn't exist
```
**Solución**: Verificar que la clase existe en Tailwind o `globals.css`

---

## 📚 Documentación Adicional

- [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) - Estructura detallada
- [COMPONENTES_GUIA.md](./COMPONENTES_GUIA.md) - Guía de componentes
- [MEJORAS_FRONTEND.md](./MEJORAS_FRONTEND.md) - Resumen de mejoras
- [CAMBIOS_ESTRUCTURA.md](./CAMBIOS_ESTRUCTURA.md) - Cambios recientes

---

## 🤝 Contribuir

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Seguir convenciones de código
3. Usar componentes reutilizables cuando sea posible
4. Mantener archivos `.jsx` para componentes/páginas
5. Documentar componentes complejos
6. Commit: `git commit -m "feat: descripción"`
7. Push: `git push origin feature/nueva-funcionalidad`

---

## 📄 Licencia

Este proyecto es propiedad de El Chalito.

---

## 📞 Contacto

Para soporte o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Versión**: 2.0.0  
**Última actualización**: Noviembre 2025  
**Estado**: ✅ Producción
