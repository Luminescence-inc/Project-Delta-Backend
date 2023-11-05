FROM node:16-alpine as development 

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY prisma ./prisma/

COPY .env ./

# COPY tsconfig.json file
COPY tsconfig.json ./

COPY . .

RUN npx prisma migrate deploy

RUN npx prisma generate

FROM node:16-alpine as production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

COPY package*.json .

RUN npm ci --only=production

COPY --from=development /usr/src/app/dist/ .

CMD ["node", "dist/index.js"]

