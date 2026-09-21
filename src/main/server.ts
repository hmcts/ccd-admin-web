#!/usr/bin/env node
import {Logger} from "@hmcts/nodejs-logging";
import * as fs from "node:fs";
import * as https from "node:https";
import * as path from "node:path";
import {app} from "./app";

const logger = Logger.getLogger("server");

const DEFAULT_PORT = "3100";
const port = process.env.PORT || DEFAULT_PORT;

if (app.locals.ENV === "development") {
  const sslDirectory = path.join(__dirname, "resources", "localhost-ssl");
  const sslOptions = {
    cert: fs.readFileSync(path.join(sslDirectory, "localhost.crt")),
    key: fs.readFileSync(path.join(sslDirectory, "localhost.key")),
    secureProtocol: "TLS_method",
  };
  const server = https.createServer(sslOptions, app);
  server.listen(port, () => {
    logger.info(`Application started: https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });
}
