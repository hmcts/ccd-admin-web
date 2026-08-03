#!/usr/bin/env node
import { Logger } from "@hmcts/nodejs-logging";
import * as fs from "fs";
import * as https from "https";
import { app } from "./app";

const logger = Logger.getLogger("server");

// TODO: set the right port for your application
const port = process.env.PORT || "3100";

if (app.locals.ENV === "development") {
  const certificatePath = process.env.HTTPS_CERT_PATH;
  const keyPath = process.env.HTTPS_KEY_PATH;
  if (certificatePath || keyPath) {
    if (!certificatePath || !keyPath) {
      throw new Error("HTTPS_CERT_PATH and HTTPS_KEY_PATH must both be set for local HTTPS");
    }
    const sslOptions = {
      cert: fs.readFileSync(certificatePath),
      key: fs.readFileSync(keyPath),
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
} else {
  app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });
}
