# ---- Base Image ----
ARG PLATFORM=""
ARG base=hmctspublic.azurecr.io/base/node${PLATFORM}:14-alpine

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

FROM ${base} as base
USER root
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/apt/lists/* \
  && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

COPY . .
RUN chown -R hmcts:hmcts .
USER hmcts

RUN yarn install --ignore-optional --network-timeout 1200000

# ---- Build Image ----
FROM base as build

RUN yarn sass

RUN sleep 1 && yarn install --ignore-optional --production --network-timeout 1200000 && yarn cache clean

# ---- Runtime Image ----
FROM ${base} as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
