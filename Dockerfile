FROM node:12.13.1

# App directory in container
WORKDIR /usr/src/app

# Copy app dependencies
COPY package*.json ./

# Download dependencies
RUN npm install

# Copy app
COPY . .

# Build application
RUN npm run build-src

EXPOSE 8085

# Start app
CMD [ "npm", "run", "start:prod" ]
