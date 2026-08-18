import { type Locator, type Page } from "@playwright/test";

export interface AdminMenuItem {
  link: Locator;
  expectedPath: string;
  pageMarker: Locator;
}

export class AdminWebPage {
  readonly heading: Locator;
  readonly importDefinitionLink: Locator;
  readonly menuItems: readonly AdminMenuItem[];
  readonly logoutLink: Locator;

  constructor(readonly page: Page) {
    const navigation = page.locator("#navigation");

    this.heading = page.locator("h1.govuk-heading-xl");
    this.importDefinitionLink = navigation.locator('a[href="/import"]');
    this.menuItems = [
      {
        link: this.importDefinitionLink,
        expectedPath: "/import",
        pageMarker: page.locator('form[action="/import"] #file'),
      },
      {
        link: navigation.locator('a[href="/reindex"]'),
        expectedPath: "/reindex",
        pageMarker: page.locator("#caseType"),
      },
      {
        link: navigation.locator('a[href="/jurisdiction?dest=userprofiles"]'),
        expectedPath: "/jurisdiction?dest=userprofiles",
        pageMarker: page.locator("#selectJurisdiction"),
      },
      {
        link: navigation.locator('a[href="/user-roles"]'),
        expectedPath: "/user-roles",
        pageMarker: page.locator('a[href="/create-user-role-form?save=create"]'),
      },
      {
        link: navigation.locator('a[href="/jurisdiction?dest=definitions"]'),
        expectedPath: "/jurisdiction?dest=definitions",
        pageMarker: page.locator("#selectJurisdiction"),
      },
      {
        link: navigation.locator('a[href="/elasticsearch"]'),
        expectedPath: "/elasticsearch",
        pageMarker: page.locator("#index-btn"),
      },
      {
        link: navigation.locator('a[href="/globalsearch"]'),
        expectedPath: "/globalsearch",
        pageMarker: page.locator("#index-btn"),
      },
      {
        link: navigation.locator('a[href="/welshDictionary"]'),
        expectedPath: "/welshDictionary",
        pageMarker: page.locator("#index-btn"),
      },
      {
        link: navigation.locator('a[href="/manageWelshDictionary"]'),
        expectedPath: "/manageWelshDictionary",
        pageMarker: page.locator('form[action="/manageWelshDictionary"] #file'),
      },
    ];
    this.logoutLink = page.locator('a[href="/logout"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  async openImportDefinition(): Promise<void> {
    await this.importDefinitionLink.click();
  }

  async openMenuItem(menuItem: AdminMenuItem): Promise<void> {
    await menuItem.link.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
