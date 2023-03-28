# Multi-stage production build for Federation-Mesh Gateway
FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "server/server.js"]
