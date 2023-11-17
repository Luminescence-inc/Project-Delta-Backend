FROM node:16-alpine as development 

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY prisma ./prisma/

COPY .env ./

# COPY tsconfig.json file
COPY tsconfig.json ./

COPY src ./src/

RUN npm run build

COPY . .

EXPOSE 5005

CMD ["npm","run", "start:prod"]


