FROM node:16

# Instalar dependencias necesarias para Playwright
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    libssl-dev \
    libgtk-3-0 \
    libasound2 \
    libgbm1

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar Playwright y navegadores
RUN npx playwright install --with-deps chromium

# Copiar el resto de archivos
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 