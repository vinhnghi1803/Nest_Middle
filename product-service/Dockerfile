FROM node:22.16

WORKDIR /app

WORKDIR /app

COPY . .

COPY package*.json ./
RUN npm install

CMD ["npm", "run", "start:dev"]