FROM node:20.17.0-alpine AS base

WORKDIR /api

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Production stage
FROM base AS production
RUN npm install --production
COPY . .
CMD ["npm", "start"]

# Development stage
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]