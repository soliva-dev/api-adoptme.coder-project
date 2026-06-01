# Imagen base ligera: Alpine reduce el tamaño de ~900MB a ~160MB
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo los manifests de dependencias primero.
# Esto permite que Docker cachee la capa de node_modules
# y no reinstale todo si solo cambia el código fuente.
COPY package*.json ./

# npm ci garantiza instalación reproducible (usa package-lock.json exacto).
# --only=production excluye devDependencies (mocha, chai, etc.)
# reduciendo el tamaño final de la imagen.
RUN npm ci --only=production

# Copiar el código fuente y los assets necesarios.
# El .dockerignore excluye: node_modules, .env, test/, contenido-clases/, etc.
COPY src ./src
COPY public ./public

# Exponer el puerto de la aplicación
EXPOSE 8080

# Comando de inicio directo con node (sin npm start para menos overhead)
CMD ["node", "src/server.js"]
