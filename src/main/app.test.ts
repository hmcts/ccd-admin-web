import { Express, Logger } from "@hmcts/nodejs-logging";
import * as bodyParser from "body-parser";
import * as config from "config";
import * as cookieParser from "cookie-parser";
import * as csrf from "csurf";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as path from "path";
import * as favicon from "serve-favicon";
//import { authCheckerUserOnlyFilter } from "./user/auth-checker-user-only-filter";
//import { Helmet, IConfig as HelmetConfig } from "./modules/helmet";
import { RouterFinder } from "./router/routerFinder";
//import { serviceFilter } from "./service/service-filter";


const env = process.env.NODE_ENV || "development";
export const appTest: express.Express = express();
appTest.locals.ENV = env;

// TODO: adjust these values to your application
Logger.config({
  environment: process.env.NODE_ENV,
  microservice: "ccd-admin-web",
  team: "CCD",
});

// setup logging of HTTP requests
appTest.use(Express.accessLogger());

const logger = Logger.getLogger("appTest");

// secure the appTestlication by adding various HTTP headers to its responses

// view engine setup
appTest.set("view engine", "html");
appTest.set("views", [path.join(__dirname, "views"), path.join(__dirname, "/../../node_modules/govuk_template_jinja/views/layouts/")]);

appTest.use(express.static(path.join(__dirname, "public")));
appTest.use(favicon(path.join(__dirname, "/public/img/favicon.ico")));
appTest.use(bodyParser.json());
appTest.use(bodyParser.urlencoded({extended: false}));
appTest.use(cookieParser());
appTest.use(express.static(path.join(__dirname, "public")));
//new Helmet(config.get<HelmetConfig>("security")).enableFor(appTest);

expressNunjucks(appTest);

// Allow appTestlication to work correctly behind a proxy (needed to pick up correct request protocol)
appTest.enable("trust proxy");

//TODO CHANGE TO true again
if (config.useCSRFProtection === false) {
  const csrfOptions = {
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    },
  };

  appTest.all(/^\/(?!import).*$/, csrf(csrfOptions), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
}

//appTest.all(/^\/(?!oauth2redirect|health).*$/, authCheckerUserOnlyFilter);
//appTest.all(/^\/(?!oauth2redirect|health).*$/, serviceFilter);
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
