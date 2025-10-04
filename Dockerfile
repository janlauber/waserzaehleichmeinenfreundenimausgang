FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev && \
    mkdir -p /app/data && \
    chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV DB_PATH=/app/data/facts.db
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]

