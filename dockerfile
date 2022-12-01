# syntax=docker/dockerfile:1

FROM node:16-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

EXPOSE 80
EXPOSE 443
EXPOSE 3306

COPY . .

CMD [ "npm", "start" ]