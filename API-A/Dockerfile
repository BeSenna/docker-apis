FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV = production
ENV PORT=3003
ENV API_B_URL=http://api-b:3004

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src
RUN npm ci --omit=dev

COPY --chown=node:node src ./src

USER node

CMD ["node", "src/server.js"]