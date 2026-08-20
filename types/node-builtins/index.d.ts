declare module "node:assert" {
  import assert = require("assert");
  export = assert;
}

declare module "node:fs" {
  import fs = require("fs");
  export = fs;
}

declare module "node:https" {
  import https = require("https");
  export = https;
}

declare module "node:path" {
  import path = require("path");
  export = path;
}

declare module "node:stream" {
  import stream = require("stream");
  export = stream;
}

declare module "node:url" {
  import url = require("url");
  export = url;
}
