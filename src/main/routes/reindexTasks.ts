import { Router } from 'express';
import { getReindexTasks } from '../service/reindex-task-service';
import { sanitize } from '../util/sanitize';

const router = Router();

router.get('/reindex', async (req, res, next) => {
  try {
    const caseType = req.query.caseType as string | undefined;
    const [allTasks, filteredTasks] = await Promise.all([
      getReindexTasks(req),          // full list for dropdown
      getReindexTasks(req, caseType) // filtered list for table
      ]);
      const caseTypes: string[] = Array.from(
        new Set<string>(allTasks.map((t: any) => t.caseType))
      ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      
      const tasks = (caseType ? filteredTasks : allTasks)
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      const responseContent: { [k: string]: any } = {};
      responseContent.adminWebAuthorization = req.adminWebAuthorization;
      responseContent.user = sanitize(JSON.stringify(req.authentication.user));
      responseContent.activePage = 'reindex';
      responseContent.tasks = tasks;
      responseContent.caseTypes = caseTypes;
      responseContent.selectedCaseType = caseType || '';
      res.status(200).render('reindexTasks', responseContent);
    } catch (error) {
      const responseContent: { [k: string]: any } = {};
      responseContent.adminWebAuthorization = req.adminWebAuthorization;
      responseContent.user = sanitize(JSON.stringify(req.authentication.user));
      responseContent.error = error;
      responseContent.tasks = [];
      responseContent.selectedCaseType = [];
      res.status(500).render('reindexTasks', responseContent);
    }
  });
  
export default router;
