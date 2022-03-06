FROM node:14-bullseye-slim AS base

WORKDIR /app

#RUN apk add make g++ gcc python3 imagemagick libmagic
RUN apt-get update && apt-get install imagemagick python build-essential -y

FROM base AS development

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile --production && cp -rL node_modules /tmp/node_modules
RUN yarn --frozen-lockfile

COPY src src
COPY scripts scripts
COPY .babelrc postcss.config.js webpack.production.config.js ./

FROM development AS builder

RUN yarn build-project

FROM base AS runner
WORKDIR /app/dist

COPY --from=builder /tmp/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/dist/package.json

ENV NODE_ENV production
EXPOSE 3000
CMD ["node", "server/index.js"]
