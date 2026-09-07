import nock from "nock";
import pa11y from "pa11y";
import supertest from "supertest";
import { Logger } from "@hmcts/nodejs-logging";
import { app } from "../../main/app";
import { expect } from "chai";
import { COOKIE_ACCESS_TOKEN } from "../../main/user/user-request-authorizer";
import { optionallyResolveRetrieveServiceToken, resolveRetrieveUserFor } from "../http-mocks/idam";

app.locals.csrf = "dummy-token";

const agent = supertest(app);
const logger = Logger.getLogger("a11y");
const CCD_IMPORT_ROLE = "ccd-import";

export interface IIssue {
  type: string;
  code: string;
}

async function runPa11y(url: string, ignoreElements: any[]): Promise<IIssue[]> {
  console.log(url); // eslint-disable-line no-console
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
        if (uri !== "/health") {
          resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
          optionallyResolveRetrieveServiceToken();

          nock("http://localhost:4451")
            .get("/api/idam/adminweb/authorization")
            .reply(200, {
              canImportDefinition: true,
              canLoadWelshTranslation: true,
              canManageDefinition: true,
              canManageUserProfile: true,
              canManageUserRole: true,
              canManageWelshTranslation: true,
            });
        }

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
  after(() => {
    nock.cleanAll();
  });

  // testing accessibility of the home page
  check("/");
  check("/health", ["WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl",
    "WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2",
    "WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206"]);
  check("/not-found",[
    "WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Abs",
    "WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2",
    "WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.Center",
    "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.InputText.Name",
    "WCAG2AA.Principle1.Guideline1_3.1_3_1.F68",
    "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.InputPassword.Name",
    "WCAG2AA.Principle1.Guideline1_3.1_3_1.F68",
  ]);
});