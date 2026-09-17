import { type Page } from "@playwright/test";
import nunjucks from "nunjucks";
import path from "node:path";

const fixtureJurisdiction = {
  id: "PLAYWRIGHT",
  name: "Playwright jurisdiction",
  description: "Jurisdiction data used by form-focused integration tests",
  case_types: [
    {
      id: "PLAYWRIGHT_CASE_TYPE",
      name: "Playwright case type",
      states: [{ id: "PLAYWRIGHT_STATE", name: "Playwright state" }],
    },
  ],
};

const templateEnvironment = new nunjucks.Environment(new nunjucks.FileSystemLoader([
  path.join(process.cwd(), "src/main/views"),
  path.join(process.cwd(), "node_modules/govuk-frontend/dist"),
  path.join(process.cwd(), "lib"),
]));

interface FormNavigationOptions {
  destination: "definitions" | "userprofiles";
  formPath: "/createdefinition" | "/createuser";
  template: string;
  templateData: Record<string, unknown>;
}

async function mockFormNavigation(page: Page, options: FormNavigationOptions): Promise<void> {
  const applicationOrigin = new URL(page.url()).origin;
  const renderedForm = templateEnvironment.render(options.template, {
    adminWebAuthorization: {
      canManageDefinition: true,
      canManageUserProfile: true,
    },
    csrfToken: "playwright-csrf-token",
    currentjurisdiction: fixtureJurisdiction.id,
    jurisdictions: JSON.stringify(JSON.stringify([fixtureJurisdiction])),
    user: "playwright-form-fixture",
    ...options.templateData,
  });
  const formHtml = renderedForm.replace(
    "</head>",
    `<script>history.replaceState(null, "", "${options.formPath}");</script></head>`,
  );

  await page.context().route(`${applicationOrigin}/jurisdiction?dest=${options.destination}`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: formHtml,
    });
  });
}

export async function mockDefinitionFormNavigation(page: Page): Promise<string> {
  await mockFormNavigation(page, {
    destination: "definitions",
    formPath: "/createdefinition",
    template: "definition/manage-definition-form.html",
    templateData: {
      heading: "Create Definition",
      submitButtonText: "Create",
    },
  });
  return fixtureJurisdiction.id;
}

export async function mockUserProfileFormNavigation(page: Page): Promise<void> {
  await mockFormNavigation(page, {
    destination: "userprofiles",
    formPath: "/createuser",
    template: "user-profiles/manage-user-profile-form.html",
    templateData: {
      heading: "Create User Profile",
      jurisdiction: fixtureJurisdiction.id,
      submitButtonText: "Create",
    },
  });
}
