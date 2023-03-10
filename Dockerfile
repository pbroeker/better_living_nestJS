FROM node:16.13-alpine3.15

ENV NODE_ENV=dev
WORKDIR /app

RUN apk update && apk add bash

COPY ./package.json ./yarn.lock /app/
RUN yarn install

COPY . /app/

RUN yarn run build