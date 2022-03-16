FROM node:17-alpine as development

ENV NODE_ENV=dev
WORKDIR /app

COPY ./package.json ./yarn.lock /app/


RUN yarn install

COPY . /app/

RUN yarn run build

FROM node:17-alpine as production

ENV NODE_ENV=prod
WORKDIR /app

COPY ./package.json ./yarn.lock /app/

RUN apk update && apk add bash
RUN yarn install --production

COPY --from=development /app/dist /app/dist
COPY --from=development /app/.env /app/
CMD ["node", "dist/main"]