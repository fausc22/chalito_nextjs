# 🚀 INICIO RÁPIDO - El Chalito Next.js

## ¡Bienvenido! Tu proyecto está LISTO ✅

---

## ⚡ Inicio en 3 Pasos

### 1️⃣ Abrir Terminal en esta carpeta
```bash
cd c:/elchalito/front-next
```

### 2️⃣ Iniciar el Servidor (las dependencias ya están instaladas)
```bash
npm run dev
```

### 3️⃣ Abrir en el Navegador
```
http://localhost:3000
```

---

## 🔑 Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| gerente | gerente123 | Gerente |
| cajero | cajero123 | Cajero |
| chef | cocina123 | Chef |

---

## ⚙️ Configuración del Backend

**IMPORTANTE:** El backend debe estar corriendo en `http://localhost:3001`

```bash
# En otra terminal
cd ../back
npm start
```

Si tu backend usa otro puerto, edita: `.env.local`

---

## 📁 Archivos Importantes

| Archivo | Para qué sirve |
|---------|----------------|
| `INSTRUCCIONES.md` | Guía completa de instalación |
| `RESUMEN_DEL_PROYECTO.md` | Resumen de todo lo creado |
| `CHECKLIST_FINAL.md` | Verificación de completitud |
| `README.md` | Documentación técnica |

---

## 🎨 Características Principales

✅ **Next.js 15** con Pages Router (NO App Router)
✅ **JavaScript** puro (sin TypeScript)
✅ **Tailwind CSS** con configuración global
✅ **100% Responsivo** (móvil, tablet, desktop)
✅ **Autenticación JWT** completa
✅ **Notificaciones** con react-hot-toast
✅ **Sin errores** - Todo funciona correctamente

---

## 🐛 Solución Rápida de Problemas

### No puedo hacer login
- Verifica que el backend esté corriendo
- Verifica que esté en puerto 3001
- Revisa la consola del navegador (F12)

### Error de CORS
- Asegúrate de que el backend permita `localhost:3000`
- Revisa `back/server.js` en la sección de CORS

### Página en blanco
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Verifica que el token esté en localStorage

---

## 📞 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

---

## 🎯 Próximos Pasos

1. ✅ Iniciar el servidor (`npm run dev`)
2. ✅ Probar el login con las credenciales de prueba
3. ✅ Navegar por el dashboard
4. ⏳ Implementar nuevos módulos (Pedidos, Ventas, etc.)
5. ⏳ Personalizar estilos según necesidad

---

## 💡 Tips

- Los estilos están en `src/styles/globals.css`
- Los colores en `tailwind.config.js`
- La configuración de API en `src/config/api.js`
- Las rutas en `src/config/routes.js`

---

## ✨ Todo está Configurado

No necesitas:
- ❌ Instalar dependencias (ya están)
- ❌ Configurar Tailwind (ya está)
- ❌ Configurar el router (ya está)
- ❌ Configurar autenticación (ya está)
- ❌ Hacer responsive (ya está)

Solo necesitas:
- ✅ Iniciar el servidor: `npm run dev`
- ✅ Ir a: `http://localhost:3000`
- ✅ Hacer login y empezar a usar

---

## 📚 Documentación Completa

Para más detalles, lee:
- **INSTRUCCIONES.md** - Guía paso a paso
- **RESUMEN_DEL_PROYECTO.md** - Qué se hizo y cómo

---

**🎉 ¡Disfruta tu nuevo proyecto Next.js!**

*Creado el 30 de Octubre de 2025*
*Sin errores - 100% funcional*
