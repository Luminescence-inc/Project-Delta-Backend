FROM node:16-alpine as development 

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY prisma ./prisma/

# COPY .env ./

ENV DATABASE_URL = ${{ secrets.DATABASE_URL }}

ENV PORT = ${{ secrets.PORT }}

ENV JWT_TOKEN_SECRET = ${{ secrets.JWT_TOKEN_SECRET }}

ENV JWT_TOKEN_SECRET_EXP = ${{ secrets.JWT_TOKEN_SECRET_EXP }}

ENV AUTH_EMAIL = ${{ secrets.AUTH_EMAIL }}

ENV AUTH_PASS = ${{ secrets.AUTH_PASS }}

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

