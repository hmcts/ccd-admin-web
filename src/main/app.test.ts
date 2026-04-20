import { Express, Logger } from "@hmcts/nodejs-logging";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import expressNunjucks from "express-nunjucks";
import path from "path";
import favicon from "serve-favicon";
import { importAll } from "./import-all/index";
import cookieSession from "cookie-session";

const env = process.env.NODE_ENV || "development";
export const appTest: express.Express = express();
appTest.locals.ENV = env;

// Session
appTest.set("trust proxy", 1); // trust first proxy
appTest.use(cookieSession({
  keys: ["key1", "key2"],
  name: "session",
}));

// setup logging of HTTP requests
appTest.use(Express.accessLogger());

const logger = Logger.getLogger("appTest");

// secure the application by adding various HTTP headers to its responses

// view engine setup
appTest.set("view engine", "html");
appTest.set("views", [path.join(__dirname, "views"), "node_modules/govuk-frontend/dist", "lib"]);

appTest.use(express.static(path.join(__dirname, "public")));
appTest.use("/assets", express.static("node_modules/govuk-frontend/dist/govuk/assets"));
appTest.use("/js/jquery.min.js", express.static("node_modules/jquery/dist/jquery.min.js"));
appTest.use("/js/jquery.validate.min.js", express.static("node_modules/jquery-validation/dist/jquery.validate.min.js"));
appTest.use("/js/govuk-frontend.min.js", express.static("node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js"));
appTest.use("/stylesheets/govuk-frontend.min.css", express.static("node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.css"));
appTest.use(favicon(path.join("node_modules", "govuk-frontend", "dist", "govuk", "assets", "images", "favicon.ico")));
appTest.use(bodyParser.json());
appTest.use(bodyParser.urlencoded({ extended: false }));
appTest.use(cookieParser());

expressNunjucks(appTest, {
  filters: {
    split: (str, separator) => {
      return str.split(separator);
    },
  },
  autoescape: undefined,
  throwOnUndefined: undefined,
  trimBlocks: undefined,
  lstripBlocks: undefined,
  tags: undefined,
});

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
appTest.enable("trust proxy");

// Set dummy accessToken, serviceAuthToken, and authentication on all requests
appTest.use((req: any, res: any, next: any) => {
  req["accessToken"] = "userAuthToken";
  req["authentication"] = {
    user: {
      email: "ccd@hmcts.net",
      id: 123,
    },
  };
  req["serviceAuthToken"] = "serviceAuthToken";
  next();
});

appTest.use("/", importAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
appTest.use((req: any, res: any) => {
  res.status(404);
  res.render("not-found");
});

// error handler
appTest.use((err, req, res, next) => {
  logger.error(`${err.stack || err.error}`);

  // set locals
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  res.render("error");
});
