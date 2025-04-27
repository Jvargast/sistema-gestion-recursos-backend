FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --omit=dev

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que la aplicación se ejecuta
EXPOSE 8080

ENV NODE_ENV=production
# Comando para ejecutar la aplicación
CMD ["npm", "start"]
