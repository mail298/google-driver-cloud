FROM node:20-alpine AS base

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=512"
ARG DATABASE_URL=mysql://root:root@mysql:3306/9drive
ARG FRONTEND_URL=https://drive9.wn-cdn.net
ARG JWT_ACCESS_SECRET=change-this-jwt-secret-at-least-32-chars
ARG TOKEN_ENCRYPTION_KEY=change-this-encryption-key-32bytes!
ENV DATABASE_URL=$DATABASE_URL
ENV FRONTEND_URL=$FRONTEND_URL
ENV JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
ENV TOKEN_ENCRYPTION_KEY=$TOKEN_ENCRYPTION_KEY

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --prefer-offline --no-audit --progress=false

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

EXPOSE 80 4000

CMD ["node", "dist/server.js"]
