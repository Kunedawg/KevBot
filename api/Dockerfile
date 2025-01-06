FROM node:20.17.0-alpine AS base

WORKDIR /api

RUN apk add --no-cache ffmpeg

COPY package*.json ./

FROM base as dependencies
RUN npm ci

FROM dependencies AS production
RUN npm prune --production
COPY . .
CMD ["npm", "start"]

FROM dependencies AS development
COPY . .
CMD ["npm", "run", "dev"]

FROM dependencies AS test
COPY . .
ENV NODE_ENV=test
CMD ["npm", "run", "test"]