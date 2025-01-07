# Usa una imagen base de Node.js
FROM node:alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --production

# Copia el resto del código de la aplicación
COPY . .

# Copia el archivo .env dentro del contenedor
COPY .env .env

# Expone el puerto en el que la aplicación se ejecuta
EXPOSE ${PORT}


# Comando para ejecutar la aplicación
CMD ["npm", "start"]
