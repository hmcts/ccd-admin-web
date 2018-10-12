FROM node:8.12.0-slim
MAINTAINER https://github.com/hmcts/ccd-admin-web

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG BUILD_DEPS='bzip2 patch'

COPY package.json yarn.lock .snyk /usr/src/app/
RUN apt-get update && apt-get install -y $BUILD_DEPS --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && yarn install

COPY src/main /usr/src/app/src/main
COPY config /usr/src/app/config

COPY gulpfile.js tsconfig.json /usr/src/app/
RUN yarn sass

RUN rm -rf node_modules \
    && yarn install --production \
    && apt-get purge -y --auto-remove $BUILD_DEPS

# TODO: expose the right port for your application
EXPOSE 3100
CMD [ "yarn", "start" ]
