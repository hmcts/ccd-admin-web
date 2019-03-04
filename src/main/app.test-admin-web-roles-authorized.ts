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
export const appTestWithAuthorizedAdminWebRoles: express.Express = express();
appTestWithAuthorizedAdminWebRoles.locals.ENV = env;

// Session
appTestWithAuthorizedAdminWebRoles.set("trust proxy", 1); // trust first proxy
appTestWithAuthorizedAdminWebRoles.use(cookieSession({
  keys: ["key1", "key2"],
  name: "session",
}));
// setup logging of HTTP requests
appTestWithAuthorizedAdminWebRoles.use(Express.accessLogger());

const logger = Logger.getLogger("appTestWithAuthorizedAdminWebRoles");

// secure the application by adding various HTTP headers to its responses

// view engine setup
appTestWithAuthorizedAdminWebRoles.set("view engine", "html");
appTestWithAuthorizedAdminWebRoles.set("views", [path.join(__dirname, "views"),
path.join(__dirname, "/../../node_modules/govuk_template_jinja/views/layouts/")]);

appTestWithAuthorizedAdminWebRoles.use(express.static(path.join(__dirname, "public")));
appTestWithAuthorizedAdminWebRoles.use(favicon(path.join(__dirname, "/public/img/favicon.ico")));
appTestWithAuthorizedAdminWebRoles.use(bodyParser.json());
appTestWithAuthorizedAdminWebRoles.use(bodyParser.urlencoded({ extended: false }));
appTestWithAuthorizedAdminWebRoles.use(cookieParser());
appTestWithAuthorizedAdminWebRoles.use(express.static(path.join(__dirname, "public")));

expressNunjucks(appTestWithAuthorizedAdminWebRoles);

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
appTestWithAuthorizedAdminWebRoles.enable("trust proxy");

// Set dummy accessToken, serviceAuthToken, and authentication on all requests
appTestWithAuthorizedAdminWebRoles.use((req, res, next) => {
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

appTestWithAuthorizedAdminWebRoles.use("/", importAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
appTestWithAuthorizedAdminWebRoles.use((req, res) => {
  res.status(404);
  res.render("not-found");
});

// error handler
appTestWithAuthorizedAdminWebRoles.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(`${err.stack || err}`);

  // set locals
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  req.authentication ? res.render("home") : res.render("error");
});
