import { type Locator, type Page } from "@playwright/test";

export interface AdminMenuItem {
  link: Locator;
  expectedPath: string;
  pageMarker: Locator;
}

export class AdminWebPage {
  readonly authenticatedMarker: Locator;
  readonly importDefinitionLink: Locator;
  readonly menuItems: readonly AdminMenuItem[];
  readonly logoutLink: Locator;

  constructor(readonly page: Page) {
    this.authenticatedMarker = page.locator("#currentUser");
    this.importDefinitionLink = page.locator('a[href="/import"]');
    this.menuItems = [
      {
        link: this.importDefinitionLink,
        expectedPath: "/import",
        pageMarker: page.locator('form[action="/import"] #file'),
      },
      {
        link: page.locator('a[href="/reindex"]'),
        expectedPath: "/reindex",
        pageMarker: page.locator("#caseType"),
      },
      {
        link: page.locator('a[href="/jurisdiction?dest=userprofiles"]'),
        expectedPath: "/jurisdiction?dest=userprofiles",
        pageMarker: page.locator("#selectJurisdiction"),
      },
      {
        link: page.locator('a[href="/user-roles"]'),
        expectedPath: "/user-roles",
        pageMarker: page.locator('a[href="/create-user-role-form?save=create"]'),
      },
      {
        link: page.locator('a[href="/jurisdiction?dest=definitions"]'),
        expectedPath: "/jurisdiction?dest=definitions",
        pageMarker: page.locator("#selectJurisdiction"),
      },
      {
        link: page.locator('a[href="/elasticsearch"]'),
        expectedPath: "/elasticsearch",
        pageMarker: page.locator("#index-btn"),
      },
      {
        link: page.locator('a[href="/globalsearch"]'),
        expectedPath: "/globalsearch",
        pageMarker: page.locator("#index-btn"),
      },
      {
        link: page.locator('a[href="/welshDictionary"]'),
        expectedPath: "/welshDictionary",
        pageMarker: page.locator("#index-btn"),
      },
      {
        link: page.locator('a[href="/manageWelshDictionary"]'),
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
