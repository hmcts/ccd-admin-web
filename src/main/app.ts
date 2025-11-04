import * as healthcheck from "@hmcts/nodejs-healthcheck";
import { Express, Logger } from "@hmcts/nodejs-logging";
import * as bodyParser from "body-parser";
import * as config from "config";
import * as cookieParser from "cookie-parser";
import * as csrf from "csurf";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as path from "path";
import * as favicon from "serve-favicon";
import { sanitize } from "./util/sanitize";

import { authCheckerUserOnlyFilter } from "./user/auth-checker-user-only-filter";
import { adminWebRoleAuthorizerFilter } from "./role/admin-web-role-authorizer-filter";
import { Helmet, IConfig as HelmetConfig } from "./modules/helmet";
import { importAll } from "./import-all/index";

const enableAppInsights = require("./app-insights/app-insights");

enableAppInsights();

import { serviceFilter } from "./service/service-filter";
import { COOKIE_ACCESS_TOKEN } from "./user/user-request-authorizer";
const cookieSession = require("cookie-session");
const env = process.env.NODE_ENV || "development";
export const app: express.Express = express();
const appHealth: express.Express = express();

app.locals.ENV = env;

// Session
app.set("trust proxy", 1); // trust first proxy

app.use(cookieSession({
  keys: ["key1", "key2"],
  name: "session",
}));

// setup logging of HTTP requests
app.use(Express.accessLogger());

const healthConfig = {
  checks: {},
};
healthcheck.addTo(appHealth, healthConfig);
app.use(appHealth);

const logger = Logger.getLogger("app");

// secure the application by adding various HTTP headers to its responses

// view engine setup
app.set("view engine", "html");
app.set("views", [path.join(__dirname, "views"),
path.join(__dirname, "/../../node_modules/govuk-frontend/"),
path.join(__dirname, "/../../node_modules/govuk_template_jinja/views/layouts/"),
path.join(__dirname, "/../../node_modules/govuk-frontend/components"),
path.join(__dirname, "/../../lib/")]);

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "/public/img/favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
new Helmet(config.get<HelmetConfig>("security")).enableFor(app);

expressNunjucks(app, {
  filters: {
    split: (str, separator) => {
      return str.split(separator);
    },
  },
});

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
app.enable("trust proxy");

if (config.useCSRFProtection === true) {
  const csrfOptions = {
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    },
  };

  app.all(/^\/(?!import|elasticsearch.*|elastic-support.*|dictionary).*$/, csrf(csrfOptions), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
}

app.all(/^\/(?!oauth2redirect|health|logout).*$/, authCheckerUserOnlyFilter);
app.all(/^\/(?!oauth2redirect|health|logout).*$/, serviceFilter);
app.all(/^\/(?!oauth2redirect|health|logout).*$/, adminWebRoleAuthorizerFilter);
app.use("/", importAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
app.use((req, res) => {
  res.status(404);
  res.render("not-found");
});

// error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(`${err.stack || err.error}`);
  // set locals
  res.locals.message = err.message;
  res.locals.error = err;

  // If the user could not be authenticated, clear the accessToken cookie to allow the user to try again
  if (req.authentication && !req.authentication.user) {
    res.clearCookie(COOKIE_ACCESS_TOKEN);
  }

  res.status(err.status || 500);
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.session.adminWebAuthorization;
  if (req.authentication) {
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  }
  res.render("error", responseContent);
});
