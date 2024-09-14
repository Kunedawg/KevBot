FROM node:20.17.0-alpine AS base

WORKDIR /api

RUN apk add --no-cache ffmpeg

COPY package*.json ./

FROM base AS production
RUN npm install --production
COPY . .
CMD ["npm", "start"]

FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]