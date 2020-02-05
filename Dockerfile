# ---- Base Image ----
ARG base=hmctspublic.azurecr.io/base/node:12-stretch-slim

FROM ${base} as base
USER root
RUN apt-get update \
  && apt-get install -y bzip2 patch --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
COPY package.json yarn.lock .snyk ./
RUN yarn install

# ---- Build Image ----
FROM base as build
COPY . .
RUN yarn sass && sleep 1 && yarn install --production

# ---- Runtime Image ----
FROM ${base} as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
