import path from "node:path";

const defaultBaseUrl = "http://localhost:3100";

export function sessionStoragePath(baseUrl = process.env.TEST_URL || defaultBaseUrl): string {
  const target = new URL(baseUrl);
  const targetKey = `${target.hostname}-${target.port || (target.protocol === "https:" ? "443" : "80")}`
    .replaceAll(/[^a-zA-Z0-9.-]/g, "-");

  return path.join(process.cwd(), ".sessions", `ccd-admin-web-${targetKey}.storage.json`);
}
