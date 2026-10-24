import path from "node:path";

const defaultBaseUrl = "http://localhost:3100";

function targetKey(baseUrl: string): string {
  const target = new URL(baseUrl);
  return `${target.hostname}-${target.port || (target.protocol === "https:" ? "443" : "80")}`
    .replaceAll(/[^a-zA-Z0-9.-]/g, "-");
}

export function sessionStoragePath(baseUrl = process.env.TEST_URL || defaultBaseUrl): string {
  return path.join(process.cwd(), ".sessions", `ccd-admin-web-${targetKey(baseUrl)}.storage.json`);
}

export function sessionCredentialsPath(baseUrl = process.env.TEST_URL || defaultBaseUrl): string {
  return path.join(process.cwd(), ".sessions", `ccd-admin-web-${targetKey(baseUrl)}.credentials.json`);
}
