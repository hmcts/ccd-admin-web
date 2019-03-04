import { Express, Logger } from "@hmcts/nodejs-logging";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as path from "path";
import * as favicon from "serve-favicon";
import { importAll } from "./import-all/index";
const cookieSession = require("cookie-session");
const env = process.env.NODE_ENV || "development";
export const appTestWithAuthroziedAdminWebRoles: express.Express = express();
appTestWithAuthroziedAdminWebRoles.locals.ENV = env;

// Session
appTestWithAuthroziedAdminWebRoles.set("trust proxy", 1); // trust first proxy
appTestWithAuthroziedAdminWebRoles.use(cookieSession({
  keys: ["key1", "key2"],
  name: "session",
}));
// setup logging of HTTP requests
appTestWithAuthroziedAdminWebRoles.use(Express.accessLogger());

const logger = Logger.getLogger("appTestWithAuthroziedAdminWebRoles");

// secure the application by adding various HTTP headers to its responses

// view engine setup
appTestWithAuthroziedAdminWebRoles.set("view engine", "html");
appTestWithAuthroziedAdminWebRoles.set("views", [path.join(__dirname, "views"),
path.join(__dirname, "/../../node_modules/govuk_template_jinja/views/layouts/")]);

appTestWithAuthroziedAdminWebRoles.use(express.static(path.join(__dirname, "public")));
appTestWithAuthroziedAdminWebRoles.use(favicon(path.join(__dirname, "/public/img/favicon.ico")));
appTestWithAuthroziedAdminWebRoles.use(bodyParser.json());
appTestWithAuthroziedAdminWebRoles.use(bodyParser.urlencoded({ extended: false }));
appTestWithAuthroziedAdminWebRoles.use(cookieParser());
appTestWithAuthroziedAdminWebRoles.use(express.static(path.join(__dirname, "public")));

expressNunjucks(appTestWithAuthroziedAdminWebRoles);

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
appTestWithAuthroziedAdminWebRoles.enable("trust proxy");

// Set dummy accessToken, serviceAuthToken, and authentication on all requests
appTestWithAuthroziedAdminWebRoles.use((req, res, next) => {
  req.accessToken = "userAuthToken";
  req.authentication = {
    user: {
      email: "ccd@hmcts.net",
      id: 123,
    },
  };
  req.adminWebAuthorization = {
    canManageUserProfile: true,
  };
  req.serviceAuthToken = "serviceAuthToken";
  next();
});

appTestWithAuthroziedAdminWebRoles.use("/", importAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
appTestWithAuthroziedAdminWebRoles.use((req, res) => {
  res.status(404);
  res.render("not-found");
});

// error handler
appTestWithAuthroziedAdminWebRoles.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(`${err.stack || err}`);

  // set locals
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  req.authentication ? res.render("home") : res.render("error");
});
