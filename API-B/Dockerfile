FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV = production
ENV PORT=3004
ENV API_A_URL=http://api-a:3003

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src
RUN npm ci --omit=dev

COPY --chown=node:node src ./src

USER node

CMD ["node", "src/server.js"]