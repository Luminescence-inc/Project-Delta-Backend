FROM node:16-alpine as development 

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY prisma ./prisma/

COPY .env ./

# ARG DATABASE_URL
# ENV DATABASE_URL = $DATABASE_URL

# ARG PORT
# ENV PORT = $PORT

# ARG JWT_TOKEN_SECRET
# ENV JWT_TOKEN_SECRET = $JWT_TOKEN_SECRET

# ARG JWT_TOKEN_SECRET_EXP
# ENV JWT_TOKEN_SECRET_EXP = $JWT_TOKEN_SECRET_EXP

# ARG AUTH_EMAIL
# ENV AUTH_EMAIL = $AUTH_EMAIL

# ARG AUTH_PASS
# ENV AUTH_PASS = $AUTH_PASS


# COPY tsconfig.json file
COPY tsconfig.json ./

COPY . .

RUN npx prisma migrate deploy

RUN npx prisma generate

CMD ["npm","run", "start:dev"]

# FROM node:16-alpine as production

# ARG NODE_ENV=production

# ENV NODE_ENV=${NODE_ENV}

# COPY package*.json .

# RUN npm ci --only=production

# COPY --from=development /usr/src/app/dist/ .
# COPY --from=development /usr/src/app/prisma/ ./prisma/
# CMD ["node", "dist/index.js"]

