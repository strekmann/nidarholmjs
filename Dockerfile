# syntax=docker/dockerfile:experimental

FROM node:lts-buster AS production-builder

USER node
WORKDIR /home/node

COPY --chown=node:node package.json yarn.lock ./
RUN --mount=type=cache,target=/tmp/.yarn-cache-1000 yarn install --frozen-lockfile --production

FROM production-builder AS development-builder

EXPOSE 3000

USER node
WORKDIR /home/node

RUN --mount=type=cache,target=/tmp/.yarn-cache-1000 yarn install --frozen-lockfile

COPY --chown=node:node ./src src
COPY --chown=node:node ./scripts scripts

RUN yarn build:schema && yarn relay && yarn run build:server

COPY --chown=node:node webpack* .
RUN yarn build:client

# package.json step would need an extra copy into the image first
COPY --chown=node:node ./config dist/config

WORKDIR /home/node/dist
ENTRYPOINT ["node", "server/index.js"]