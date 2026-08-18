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
    this.heading = page.getByRole("heading", { name: "Welcome to CCD Admin Web" });
    this.importDefinitionLink = page.getByRole("link", { name: "Import Case Definition" });
    this.menuItems = [
      {
        link: this.importDefinitionLink,
        expectedPath: "/import",
        pageMarker: page.getByRole("heading", { name: "Import Case Definition" }),
      },
      {
        link: page.getByRole("link", { name: "Reindex Tasks", exact: true }),
        expectedPath: "/reindex",
        pageMarker: page.getByRole("heading", { name: "Reindexed Tasks" }),
      },
      {
        link: page.getByRole("link", { name: "Manage User Profiles", exact: true }),
        expectedPath: "/jurisdiction?dest=userprofiles",
        pageMarker: page.getByRole("heading", { name: "Jurisdiction Search" }),
      },
      {
        link: page.getByRole("link", { name: "Manage User Roles", exact: true }),
        expectedPath: "/user-roles",
        pageMarker: page.getByRole("link", { name: "Create User Role", exact: true }),
      },
      {
        link: page.getByRole("link", { name: "Manage Definitions", exact: true }),
        expectedPath: "/jurisdiction?dest=definitions",
        pageMarker: page.getByRole("heading", { name: "Jurisdiction Search" }),
      },
      {
        link: page.getByRole("link", { name: "Create Elasticsearch Indices", exact: true }),
        expectedPath: "/elasticsearch",
        pageMarker: page.getByRole("heading", { name: "Create Elasticsearch Indices" }),
      },
      {
        link: page.getByRole("link", { name: "Create Global Search Indices", exact: true }),
        expectedPath: "/globalsearch",
        pageMarker: page.getByRole("heading", { name: "Create Global Search Indices" }),
      },
      {
        link: page.getByRole("link", { name: "Welsh Translations", exact: true }),
        expectedPath: "/welshDictionary",
        pageMarker: page.getByRole("heading", { name: "Welsh Dictionary" }),
      },
      {
        link: page.getByRole("link", { name: "Manage Welsh Translations", exact: true }),
        expectedPath: "/manageWelshDictionary",
        pageMarker: page.getByRole("heading", { name: "Import Welsh Translations" }),
      },
    ];
    this.logoutLink = page.getByRole("link", { name: "Logout" });
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
