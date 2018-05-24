#!/usr/bin/env node
import { Logger } from "@hmcts/nodejs-logging";
import { app } from "./app";

const logger = Logger.getLogger("server");

// TODO: set the right port for your application
const port = process.env.PORT || "3100";

app.listen(port, () => {
  logger.info(`Application started: http://localhost:${port}`);
});
