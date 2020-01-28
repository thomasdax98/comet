#!/bin/sh
set -e

#docker-compose run --rm client bash -c "npm install && npm run lint"
if [ -n "$INSTALL_DEPS" ]; then 
    docker run --rm -v `pwd`:/opt/app-root/src \
        -u ${RUN_AS_UID}:0 \
        eu.gcr.io/vivid-planet-public/dev/node-10-dev:node-yarn \
        bash -c "npm install"
fi

docker run --rm -v `pwd`:/opt/app-root/src \
    -u ${RUN_AS_UID}:0 \
    eu.gcr.io/vivid-planet-public/dev/node-10-dev:node-yarn \
    bash -c "npm run lint"
