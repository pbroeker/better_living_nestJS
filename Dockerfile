FROM node:17-alpine

ENV NODE_ENV=dev
WORKDIR /app

COPY ./package.json ./yarn.lock /app/

RUN yarn install

COPY . /app/

RUN yarn run build
