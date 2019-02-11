# ---- Base Image ----
FROM hmcts.azurecr.io/hmcts/base/node/stretch-slim-lts-8 as base
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
FROM hmcts.azurecr.io/hmcts/base/node/stretch-slim-lts-8 as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
USER hmcts