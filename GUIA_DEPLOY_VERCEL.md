# 🚀 Guía Paso a Paso: Deploy en Vercel

Esta guía te ayudará a desplegar tu frontend de El Chalito en Vercel.

---

## 📋 Prerrequisitos

1. ✅ Cuenta en [Vercel](https://vercel.com) (puedes crear una con GitHub, GitLab o email)
2. ✅ Proyecto en un repositorio Git (GitHub, GitLab o Bitbucket)
3. ✅ Backend desplegado y accesible (necesitarás su URL)
4. ✅ Node.js instalado localmente (para pruebas)

---

## 🔧 Paso 1: Preparar el Proyecto Localmente

### 1.1 Verificar que el proyecto compile correctamente

```bash
# En la carpeta del frontend
cd C:\Users\facu_\elchalito\chalito-frontend

# Instalar dependencias (si no lo has hecho)
npm install

# Probar el build de producción
npm run build
```

Si el build es exitoso, verás un mensaje como:
```
✓ Compiled successfully
```

### 1.2 Verificar variables de entorno

Asegúrate de tener configurada la variable `NEXT_PUBLIC_API_URL` que apunte a tu backend.

---

## 📦 Paso 2: Subir el Código a Git

Si tu proyecto aún no está en Git, sigue estos pasos:

### 2.1 Inicializar Git (si no está inicializado)

```bash
# En la carpeta del frontend
git init
```

### 2.2 Crear archivo .gitignore (si no existe)

Asegúrate de que `.gitignore` incluya:
```
node_modules/
.next/
.env.local
.env*.local
.vercel
*.log
.DS_Store
```

### 2.3 Hacer commit y push

```bash
# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar proyecto para deploy en Vercel"

# Conectar con tu repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/chalito-frontend.git

# Subir al repositorio
git push -u origin main
```

> **Nota**: Si ya tienes el proyecto en Git, solo asegúrate de que todos los cambios estén pusheados.

---

## 🌐 Paso 3: Desplegar en Vercel

### 3.1 Crear cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (o GitLab/Bitbucket si prefieres)
4. Autoriza a Vercel a acceder a tus repositorios

### 3.2 Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio `chalito-frontend`
3. Vercel detectará automáticamente que es un proyecto Next.js

### 3.3 Configurar el Proyecto

Vercel te mostrará una pantalla de configuración. Configura lo siguiente:

#### Framework Preset
- **Framework Preset**: `Next.js` (debería detectarse automáticamente)

#### Build Settings
- **Build Command**: `npm run build` (por defecto)
- **Output Directory**: `.next` (por defecto)
- **Install Command**: `npm install` (por defecto)

#### Environment Variables
Aquí es **MUY IMPORTANTE** configurar las variables de entorno:

1. Haz clic en **"Environment Variables"**
2. Agrega la siguiente variable:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://tu-backend-url.com` |

   > ⚠️ **IMPORTANTE**: 
   > - Reemplaza `https://tu-backend-url.com` con la URL real de tu backend desplegado
   > - Si tu backend está en otro servicio (Railway, Render, Heroku, etc.), usa esa URL
   > - Asegúrate de usar `https://` (no `http://`) para producción

3. Selecciona los ambientes donde aplicará:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 3.4 Deploy

1. Haz clic en **"Deploy"**
2. Espera a que Vercel construya y despliegue tu proyecto (2-5 minutos)
3. Verás el progreso en tiempo real

---

## ✅ Paso 4: Verificar el Deploy

### 4.1 Revisar el Build

Una vez completado el deploy:

1. Si el build fue exitoso, verás un mensaje: **"Congratulations! Your project has been deployed."**
2. Obtendrás una URL como: `https://chalito-frontend.vercel.app`

### 4.2 Probar la Aplicación

1. Haz clic en la URL proporcionada
2. Verifica que la aplicación carga correctamente
3. Prueba hacer login (debería conectarse a tu backend)

### 4.3 Revisar Logs (si hay errores)

Si hay problemas:
1. Ve a la pestaña **"Deployments"** en Vercel
2. Haz clic en el deployment que falló
3. Revisa los **"Build Logs"** para ver errores

---

## 🔄 Paso 5: Configurar Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En el dashboard de Vercel, ve a **Settings** → **Domains**
2. Ingresa tu dominio (ej: `app.elchalito.com`)
3. Sigue las instrucciones para configurar los DNS
4. Vercel te dará los registros DNS que debes agregar en tu proveedor de dominio

---

## 🔧 Paso 6: Configurar el Backend para CORS

Asegúrate de que tu backend permita peticiones desde tu dominio de Vercel:

### Ejemplo para Express.js:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://chalito-frontend.vercel.app',
    'https://tu-dominio-personalizado.com',
    'http://localhost:3000' // Para desarrollo local
  ],
  credentials: true
}));
```

---

## 📝 Paso 7: Actualizar Variables de Entorno

Si necesitas cambiar la URL del backend después del deploy:

1. Ve a **Settings** → **Environment Variables**
2. Edita `NEXT_PUBLIC_API_URL`
3. Haz un nuevo deploy (o Vercel lo hará automáticamente si tienes auto-deploy activado)

---

## 🚨 Troubleshooting

### Error: "Build Failed"

**Causas comunes:**
- ❌ Errores de sintaxis en el código
- ❌ Dependencias faltantes
- ❌ Variables de entorno no configuradas

**Solución:**
1. Revisa los logs del build en Vercel
2. Prueba `npm run build` localmente para reproducir el error
3. Corrige los errores y haz push nuevamente

### Error: "Cannot connect to API"

**Causa:**
- La variable `NEXT_PUBLIC_API_URL` no está configurada o es incorrecta

**Solución:**
1. Verifica en **Settings** → **Environment Variables** que la variable existe
2. Asegúrate de que la URL del backend sea correcta y accesible
3. Verifica que el backend permita CORS desde tu dominio de Vercel

### Error: "Module not found"

**Causa:**
- Dependencias faltantes en `package.json`

**Solución:**
1. Verifica que todas las dependencias estén en `package.json`
2. Ejecuta `npm install` localmente
3. Haz commit y push de `package.json` y `package-lock.json`

### El sitio carga pero no se conecta al backend

**Causas:**
- CORS no configurado en el backend
- URL del backend incorrecta
- Backend no está desplegado o no es accesible

**Solución:**
1. Verifica que el backend esté desplegado y funcionando
2. Prueba hacer una petición directa al backend desde el navegador
3. Revisa la consola del navegador para ver errores de CORS
4. Configura CORS en el backend para permitir tu dominio de Vercel

---

## 🔄 Deploy Automático

Vercel hace deploy automático cuando:
- ✅ Haces push a la rama `main` (o `master`)
- ✅ Creas un Pull Request (genera un preview)

Para desactivar el auto-deploy:
1. Ve a **Settings** → **Git**
2. Desactiva **"Automatic deployments from Git"**

---

## 📊 Monitoreo y Analytics

Vercel incluye:
- **Analytics**: Visitas y rendimiento
- **Speed Insights**: Métricas de velocidad
- **Logs**: Logs en tiempo real de tu aplicación

Accede desde el dashboard de tu proyecto.

---

## 🎯 Resumen de URLs Importantes

Después del deploy, tendrás:

- **URL de Producción**: `https://chalito-frontend.vercel.app`
- **URL de Preview**: Se genera automáticamente para cada PR
- **Dashboard**: `https://vercel.com/dashboard`

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)

---

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] Proyecto compila sin errores (`npm run build`)
- [ ] Código subido a Git
- [ ] Proyecto importado en Vercel
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy exitoso
- [ ] Aplicación carga correctamente
- [ ] Login funciona (conexión con backend)
- [ ] Backend configurado para CORS
- [ ] Dominio personalizado configurado (si aplica)

---

**¡Listo!** Tu aplicación debería estar funcionando en Vercel. 🎉

Si tienes problemas, revisa los logs en Vercel o la sección de Troubleshooting arriba.

