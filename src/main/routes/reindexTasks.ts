import { Router } from 'express';
import { getReindexTasks } from '../service/reindex-task-service';
import { sanitize } from '../util/sanitize';

const router = Router();

router.get('/reindex', async (req, res, next) => {
  try {
    const tasks = await getReindexTasks(req);

    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.activePage = 'reindex';
    responseContent.tasks = tasks;

    res.status(200).render('reindexTasks', responseContent);
  } catch (error) {
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.error = error;
    res.status(500).render('reindexTasks', responseContent);
  }
});

export default router;
