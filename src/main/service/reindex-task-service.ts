import * as config from 'config';
import * as request from 'superagent';
import { Logger } from '@hmcts/nodejs-logging';

const logger = Logger.getLogger(__filename);

export function getReindexTasks(req, caseType?: string) {
  let url = config.get('adminWeb.reindex_tasks_url');
  if (caseType) {
      url += `?caseType=${encodeURIComponent(caseType)}`;
  }
  const headers = {
  Authorization: req.accessToken,
  ServiceAuthorization: req.serviceAuthToken,
  };

  return request
  .get(url)
  .set(headers)
  .then((res) => {
      logger.info(`Received successful response: ${res.text}`);
      return res.body;
      })
  .catch((error) => {
    if (error.response) {
      const status = error.status || error.response.status;
      const message = error.response.text || 'No response text';
      logger.error(`Error fetching reindex tasks (HTTP ${status}): ${message}`);
      throw new Error(`Reindex fetch failed with HTTP ${status}: ${message}`);
    } else {
      logger.error('Error fetching reindex tasks: no response received');
      throw new Error('Reindex fetch failed: no HTTP response');
    }
  });
}