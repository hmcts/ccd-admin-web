import { addTo } from "@hmcts/nodejs-healthcheck";
import { Express, Logger } from "@hmcts/nodejs-logging";
import bodyParser from "body-parser";
import config from "config";
import cookieParser from "cookie-parser";
import csurf from "@dr.pogodin/csurf";
import express from "express";
import expressNunjucks from "express-nunjucks";
import path from "path";
import favicon from "serve-favicon";
import { sanitize } from "./util/sanitize";
import { authCheckerUserOnlyFilter } from "./user/auth-checker-user-only-filter";
import { adminWebRoleAuthorizerFilter } from "./role/admin-web-role-authorizer-filter";
import { Helmet, IConfig as HelmetConfig } from "./modules/helmet";
import { importAll } from "./import-all/index";
import enableAppInsights from "./app-insights/app-insights";
import { serviceFilter } from "./service/service-filter";
import { COOKIE_ACCESS_TOKEN } from "./user/user-request-authorizer";
import cookieSession from "cookie-session";

enableAppInsights();
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
addTo(appHealth, healthConfig);
app.use(appHealth);

// view engine setup
app.set("view engine", "html");
app.set("views", [path.join(__dirname, "views"), "node_modules/govuk-frontend/dist", "lib"]);

const caching = {cacheControl: true, setHeaders: (res) => res.setHeader("Cache-Control", "max-age=604800")};

app.use(express.static(path.join(__dirname, "public"), caching));
app.use("/assets", express.static("node_modules/govuk-frontend/dist/govuk/assets", caching));
app.use("/js/jquery.min.js", express.static("node_modules/jquery/dist/jquery.min.js", caching));
app.use("/js/jquery.validate.min.js", express.static("node_modules/jquery-validation/dist/jquery.validate.min.js", caching));
app.use("/js/govuk-frontend.min.js", express.static("node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js", caching));
app.use("/stylesheets/govuk-frontend.min.css", express.static("node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.css", caching));
app.use(favicon(path.join("node_modules", "govuk-frontend", "dist", "govuk", "assets", "images", "favicon.ico")));
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
  autoescape: undefined,
  throwOnUndefined: undefined,
  trimBlocks: undefined,
  lstripBlocks: undefined,
  tags: undefined,
});

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
app.enable("trust proxy");

if (config.get<boolean>("useCSRFProtection") === true) {
  const csrfOptions = {
    cookie: {
      httpOnly: true,
      key: "_csrf",
      path: "/",
      sameSite: "lax" as const,
      secure: true,
    },
  };

  app.all(/^\/(?!import|elasticsearch.*|elastic-support.*|dictionary).*$/, csurf(csrfOptions), (req: any, res: any, next: any) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
}

app.all(/^\/(?!oauth2redirect|health|logout).*$/, authCheckerUserOnlyFilter);
app.all(/^\/(?!oauth2redirect|health|logout).*$/, serviceFilter);
app.all(/^\/(?!oauth2redirect|health|logout).*$/, adminWebRoleAuthorizerFilter);
app.use("/", importAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
app.use((req: any, res: any) => {
  res.status(404);
  res.render("not-found");
});

// error handler
const logger = Logger.getLogger("app");
app.use((err, req, res, next) => {
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
