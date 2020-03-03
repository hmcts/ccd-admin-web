# ---- Base Image ----
ARG base=hmctspublic.azurecr.io/base/node:12-alpine

FROM ${base} as base
USER root
RUN apk update \
  && apk add bzip2 patch \
  && rm -rf /var/lib/apt/lists/* \
  && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
COPY package.json yarn.lock .snyk ./
RUN yarn install --ignore-optional

# ---- Build Image ----
FROM base as build
COPY . .
RUN yarn sass && sleep 1 && yarn install --ignore-optional --production \
  && yarn cache clean

# ---- Runtime Image ----
FROM ${base} as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
