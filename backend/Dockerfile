FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --prefer-offline --no-audit

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

EXPOSE 80 4000

CMD ["node", "dist/server.js"]
