FROM node:17-alpine

ENV NODE_ENV=dev
WORKDIR /app

RUN apt-get update && apt-get install
COPY ./package.json ./yarn.lock /app/

RUN yarn install

COPY . /app/

RUN yarn run build
