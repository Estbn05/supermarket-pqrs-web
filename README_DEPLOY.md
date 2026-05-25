# Despliegue frontend PQRS

La web del gestor usa el backend desplegado en Render:

```text
https://supermarket-pqrs-api.onrender.com/api
```

## Vercel

1. Subir la carpeta `frontend` a un repositorio de GitHub o usarla como directorio raiz del proyecto en Vercel.
2. En Vercel seleccionar framework `Angular`.
3. Configurar:

```text
Build Command: npm run build -- --configuration production
Output Directory: dist/pqrs-frontend/browser
Install Command: npm install
```

4. Confirmar que `vercel.json` quede en la raiz del frontend. Este archivo redirige las rutas internas de Angular hacia `index.html`, por ejemplo `/gestor/login` y `/gestor/panel`.

## Prueba despues del despliegue

1. Abrir `/gestor/login`.
2. Iniciar sesion con el gestor creado en Supabase.
3. Validar listado, filtros, cambio de estado y reporte PDF.
4. Confirmar que los radicados sin archivo muestren `Sin anexo`.
