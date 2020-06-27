# syntax=docker/dockerfile:experimental

FROM node:14-alpine

EXPOSE 3000

USER node
WORKDIR /home/node

COPY --chown=node:node ./dist dist

# package.json step would need an extra copy into the image first
COPY --chown=node:node ./config dist/config

WORKDIR /home/node/dist
ENTRYPOINT ["node", "server/index.js"]