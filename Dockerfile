FROM node:20-alpine AS builder

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build


FROM node:20-alpine as final

WORKDIR /app

COPY --from=builder --chown=node:node /app/dist /app/dist

COPY --from=builder --chown=node:node /app/node_modules /app/node_modules

COPY --chown=node:node ./package.json /app

EXPOSE 3333

CMD [ "npm", "run", "start:prod"]