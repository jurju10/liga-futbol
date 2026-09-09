# Liga Vecinal — web en directo

App para que los colaboradores registren goles y tarjetas en directo mientras
ven el partido, y cualquiera pueda seguirlo online.

Usa **Netlify Blobs** como base de datos compartida (no hace falta ningún
otro servicio: todo vive dentro de tu cuenta gratuita de Netlify).

## Desplegar en Netlify (sin usar la terminal)

1. Sube todo este proyecto a un repositorio de GitHub:
   - Crea una cuenta gratuita en https://github.com si no tienes.
   - Crea un repositorio nuevo (botón verde "New").
   - Sube estos archivos arrastrándolos a la web de GitHub ("Add file" →
     "Upload files"), manteniendo la misma estructura de carpetas.
2. Ve a https://app.netlify.com → "Add new site" → "Import an existing
   project" → conecta tu cuenta de GitHub → elige el repositorio.
3. Netlify detecta automáticamente `netlify.toml` (build command
   `npm run build`, carpeta `dist`, funciones en `netlify/functions`, que
   incluyen tanto el marcador en directo como un contador de visitas).
   Solo dale a "Deploy site".
4. En 1-2 minutos tendrás una URL pública tipo
   `https://tu-liga-1234.netlify.app` — ese es el enlace para compartir con
   colaboradores y espectadores.

No hace falta configurar nada más: Netlify Blobs se activa solo al desplegar
funciones, sin claves ni variables de entorno que rellenar.

## Desarrollo local (opcional, si tienes Node.js instalado)

```bash
npm install
npm run dev
```

La función serverless (`/api/liga-data`) solo funciona desplegada en Netlify
o usando `netlify dev` (Netlify CLI); con `npm run dev` a secas verás la
interfaz pero no se guardarán datos.

## Cambiar la clave de colaborador

Por defecto la clave maestra es `CAMPO10` (se ve al principio de
`src/App.jsx`, constante `CODIGO_EDICION`). Cámbiala antes de compartir la
web si quieres una clave propia.
