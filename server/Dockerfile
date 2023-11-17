FROM node:16-alpine as development 

WORKDIR /usr/src/app

COPY package*.json .

# COPY tsconfig.json file
COPY tsconfig.json ./

COPY src ./src/

COPY .env ./

COPY prisma ./prisma/

RUN npm install

RUN npm run build

COPY . .

EXPOSE 5005

CMD ["npm","run", "start:prod"]


