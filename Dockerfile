FROM node:14-alpine as base

WORKDIR /app
COPY package*.json ./

FROM base as production
ENV NODE_ENV=production
RUN npm install -g nodemon && npm install -g bunyan && npm ci
COPY . .
CMD ["npm", "run", "prod"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install -g bunyan && npm install
COPY . .
CMD ["npm", "run", "dev"]