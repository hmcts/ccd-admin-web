import { get } from "config";

export function isElasticSearchReindexEnabled(): boolean {
  return get<boolean>("adminWeb.elastic_search_reindex_enabled");
}
