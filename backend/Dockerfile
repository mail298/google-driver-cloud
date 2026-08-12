FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl ca-certificates

ENV NODE_OPTIONS="--max-old-space-size=512"
ENV DATABASE_URL="mysql://root:root@mysql:3306/9drive"
ENV FRONTEND_URL="https://drive9.wn-cdn.net"
ENV JWT_ACCESS_SECRET="\$2a\$10\$3OOX0YLB52DERef3Q/jn9ei0zTME0ieZrcYQ4mflZ.BPgTMszTgsq"
ENV TOKEN_ENCRYPTION_KEY="uf2Tqd29Y6l2RFhM9xLQ0bvmfRjyroxjQI2HRsQH3rdjdE1SgvVvMjkwZJxlXrMb"

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --prefer-offline --no-audit --progress=false

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

EXPOSE 80 4000

CMD ["node", "dist/server.js"]
