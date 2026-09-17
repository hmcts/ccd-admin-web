import { IdamUtils } from "@hmcts/playwright-common";
import { randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { sessionCredentialsPath } from "./session";

const adminUserRoleNames = [
  "idam-user-dashboard--access",
  "ccd-import",
  "load-translations",
  "manage-translations",
] as const;

interface AdminUserCredentials {
  username: string;
  password: string;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.map((value) => value?.trim()).find(Boolean);
}

function targetEnvironment(baseUrl: string): string {
  const configuredEnvironment = firstNonEmpty(process.env.TEST_ENV)?.toLowerCase();
  if (configuredEnvironment) {
    if (configuredEnvironment === "preview") {
      return "aat";
    }
    if (configuredEnvironment === "spreview") {
      return "saat";
    }
    return configuredEnvironment;
  }

  const hostname = new URL(baseUrl).hostname;
  return hostname.includes(".demo.") ? "demo" : "aat";
}

function configureIdamUrls(environment: string): void {
  process.env.IDAM_WEB_URL ??= `https://idam-web-public.${environment}.platform.hmcts.net`;
  process.env.IDAM_TESTING_SUPPORT_URL ??=
    `https://idam-testing-support-api.${environment}.platform.hmcts.net`;
}

function createPassword(): string {
  return `Ccd1!${randomBytes(18).toString("base64url")}`;
}

function readCachedCredentials(baseUrl: string): AdminUserCredentials | undefined {
  const credentialsPath = sessionCredentialsPath(baseUrl);
  if (!fs.existsSync(credentialsPath)) {
    return undefined;
  }

  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8")) as Partial<AdminUserCredentials>;
    if (typeof credentials.username === "string" && typeof credentials.password === "string") {
      return { username: credentials.username, password: credentials.password };
    }
  } catch {
    // A malformed cache is replaced by newly generated credentials.
  }
  return undefined;
}

function cacheCredentials(baseUrl: string, credentials: AdminUserCredentials): void {
  const credentialsPath = sessionCredentialsPath(baseUrl);
  fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials), { encoding: "utf8", mode: 0o600 });
  fs.chmodSync(credentialsPath, 0o600);
}

export async function resolveAdminUserCredentials(baseUrl: string): Promise<AdminUserCredentials> {
  const username = firstNonEmpty(process.env.PLAYWRIGHT_USERNAME);
  const password = firstNonEmpty(process.env.PLAYWRIGHT_PASSWORD);
  if (username || password) {
    if (!username || !password) {
      throw new Error("PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD must be supplied together");
    }
    return { username, password };
  }

  const cachedCredentials = readCachedCredentials(baseUrl);
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const clientId = firstNonEmpty(process.env.CREATE_USER_CLIENT_ID, process.env.IDAM_OAUTH2_CLIENT_ID)
    ?? "ccd_admin";
  const clientSecret = firstNonEmpty(
    process.env.CREATE_USER_CLIENT_SECRET,
    process.env.IDAM_OAUTH2_AW_CLIENT_SECRET,
    process.env.OAUTH2_CLIENT_SECRET,
  );
  if (!clientSecret) {
    throw new Error(
      "Dynamic CCD Admin user creation requires CREATE_USER_CLIENT_SECRET, "
      + "IDAM_OAUTH2_AW_CLIENT_SECRET or OAUTH2_CLIENT_SECRET; alternatively supply static PLAYWRIGHT credentials",
    );
  }

  const environment = targetEnvironment(baseUrl);
  configureIdamUrls(environment);

  const idamUtils = new IdamUtils();
  const bearerToken = await idamUtils.generateIdamToken({
    grantType: "client_credentials",
    clientId,
    clientSecret,
    scope: firstNonEmpty(process.env.CREATE_USER_SCOPE) ?? "profile roles",
  });

  const id = randomUUID();
  const generatedPassword = createPassword();
  const createdUser = await idamUtils.createUser({
    bearerToken,
    password: generatedPassword,
    user: {
      id,
      email: `ccd-admin-web-${id}@test.${environment}`,
      forename: `fn_${id}`,
      surname: `sn_${id}`,
      roleNames: [...adminUserRoleNames],
    },
  });

  const credentials = {
    username: createdUser.email,
    password: generatedPassword,
  };
  cacheCredentials(baseUrl, credentials);
  return credentials;
}
