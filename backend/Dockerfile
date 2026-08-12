FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl ca-certificates

ENV NODE_OPTIONS="--max-old-space-size=512"
ENV DATABASE_URL="mysql://root:root@mysql:3306/9drive"
ENV FRONTEND_URL="https://drive9.wn-cdn.net"
ENV JWT_ACCESS_SECRET="change-this-jwt-secret-at-least-32-chars-long-string-for-safe-build"
ENV TOKEN_ENCRYPTION_KEY="change-this-encryption-key-at-least-32-bytes-long-string-for-safe-build"

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --prefer-offline --no-audit --progress=false

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

EXPOSE 80 4000

CMD ["node", "dist/server.js"]
