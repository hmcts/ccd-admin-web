import { Express, Logger } from "@hmcts/nodejs-logging";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as path from "path";
import * as favicon from "serve-favicon";
import { RouterFinder } from "./router/routerFinder";
const cookieSession = require("cookie-session");
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
appTest.set("views", [path.join(__dirname, "views"),
path.join(__dirname, "/../../node_modules/govuk_template_jinja/views/layouts/")]);

appTest.use(express.static(path.join(__dirname, "public")));
appTest.use(favicon(path.join(__dirname, "/public/img/favicon.ico")));
appTest.use(bodyParser.json());
appTest.use(bodyParser.urlencoded({ extended: false }));
appTest.use(cookieParser());
appTest.use(express.static(path.join(__dirname, "public")));

expressNunjucks(appTest);

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
appTest.enable("trust proxy");

// Set dummy accessToken, serviceAuthToken, and authentication on all requests
appTest.use((req, res, next) => {
  req.accessToken = "userAuthToken";
  req.authentication = {
    user: {
      email: "ccd@hmcts.net",
      id: 123,
    },
  };
  req.serviceAuthToken = "serviceAuthToken";
  next();
});

appTest.use("/", RouterFinder.findAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
appTest.use((req, res) => {
  res.status(404);
  res.render("not-found");
});

// error handler
appTest.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(`${err.stack || err}`);

  // set locals
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  req.authentication ? res.render("home") : res.render("error");
});
