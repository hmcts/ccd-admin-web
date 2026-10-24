import { setupSession } from "./session.global-setup";

export default async function integrationSessionGlobalSetup(): Promise<void> {
  await setupSession({ forceRefresh: true });
}
