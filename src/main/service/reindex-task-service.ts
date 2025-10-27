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
      logger.info(`Received successful response:${res.text}`);
      return res.body;
      })
  .catch((error) => {
    if (error.response) {
      logger.error(`Error fetching reindex tasks: ${error.response.text}`);
    } else {
      logger.error('Error fetching reindex tasks: no response received');
    }
    throw error;
  });
}