#!/bin/bash
set -x
img=$(buildah from --name nidarholm node:14-alpine)
buildah config --port 3000 "$img"
buildah config --workingdir /home/node "$img"
buildah run "$img" apk add --no-cache make g++ gcc python
#buildah run yarn install --frozen-lockfile --production
#buildah run cp -r node_modules node_modules_production
buildah run "$img" yarn install --frozen-lockfile
buildah run "$img" yarn build-project
buildah run "$img" mv node_modules dist/node_modules
buildah copy "$img" config dist/config
buildah config --workingdir /home/node/dist "$img"
buildah config --entrypoint '["node", "server/index.js"]' "$img"
buildah commit "$img" "test"
buildah rm "$img"

