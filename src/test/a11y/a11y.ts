import nock from "nock";
import pa11y from "pa11y";
import supertest from "supertest";
import { Logger } from "@hmcts/nodejs-logging";
import { app } from "../../main/app";
import { expect } from "chai";
import config from "config";
import { COOKIE_ACCESS_TOKEN } from "../../main/user/user-request-authorizer";

app.locals.csrf = "dummy-token";

const idamBaseUrl: string = config.get<string>("idam.base_url");
const idamS2SUrl: string = config.get<string>("idam.s2s_url");

const agent = supertest(app);
const logger = Logger.getLogger("a11y");

export interface IIssue {
  type: string;
  code: string;
}

async function runPa11y(url: string, ignoreElements: any[]): Promise<IIssue[]> {
  const result = await pa11y(url, {
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      ignoreHTTPSErrors: false,
    },
    headers: {
      Authorization: "abc",
      Cookie: `${COOKIE_ACCESS_TOKEN}=ABC`,
    },
    // Ignore GovUK template elements that are outside the team's control from a11y tests
    hideElements: "#logo, .logo, .copyright, link[rel=mask-icon], .govuk-visually-hidden",
    ignore: ignoreElements,
    includeWarnings: true,
    threshold: 9,
  });
  return result.issues;
}

function check(uri: string, ignoreElements?: any[]): void {
  describe(`Page ${uri}`, () => {
    describe(`Pa11y tests for ${uri}`, () => {
      let issues: IIssue[];
      before(async () => {
        const url = agent.get(uri).url;
        logger.info(`Running accessibility tests for ${url}`);
        issues = await runPa11y(url, ignoreElements || []);
      });

      it("should have no accessibility errors", () => {
        ensureNoAccessibilityAlerts("error", issues);
      });

      it("should have no accessibility warnings", () => {
        ensureNoAccessibilityAlerts("warning", issues);
      });
    });
  });
}

function ensureNoAccessibilityAlerts(issueType: string, issues: IIssue[]): void {
  const alerts: IIssue[] = issues.filter((issue: IIssue) => issue.type === issueType);
  logger.info(`alerts:: ${JSON.stringify(alerts)}`);
  expect(alerts, `\n${JSON.stringify(alerts, null, 2)}\n`).to.be.empty;
}

describe("Accessibility", () => {
  before(() => {
    nock(idamBaseUrl)
      .persist()
      .get("/o/userinfo")
      .reply(200, { uid: "1234", roles: ["ccd-import"] });

    nock(idamS2SUrl)
      .persist()
      .post("/lease")
      .reply(200, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJhZG1pbiI6dHJ1ZSwiZXhwIjoiIn0.ExHo7njTb2e6OQKPgi84Hcgo5k0tVwVvRrdGEV77uf0"); // fake token
  
    nock("http://localhost:4451")
      .persist()
      .get("/api/idam/adminweb/authorization")
      .reply(200, {
        canImportDefinition: true,
        canLoadWelshTranslation: true,
        canManageDefinition: true,
        canManageUserProfile: true,
        canManageUserRole: true,
        canManageWelshTranslation: true,
      });
  });

  after(() => {
    nock.cleanAll();
  });

  // testing accessibility of the home page
  check("/");
  check("/health", ["WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl",
    "WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2",
    "WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206"]);
  check("/not-found",["WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Abs"]);
});