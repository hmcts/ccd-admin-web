import { Router } from "express";
import { getReindexTasks } from "../service/reindex-task-service";
import { sanitize } from "../util/sanitize";

const router = Router();
const DEFAULT_PAGE_SIZE = 25;
const CASE_TYPES_FETCH_SIZE = 10000;

function isPagedResponse(response: any): boolean {
  return response && Array.isArray(response.content);
}

function getValidPage(pageParam: unknown): number {
  const parsedPage = Number(pageParam);
  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }
  return Math.floor(parsedPage);
}

function getPaginationPages(currentPage: number, totalPages: number): Array<number | string> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

router.get("/reindex", async (req, res) => {
  try {
    const caseType = req.query.caseType as string | undefined;
    const requestedPage = getValidPage(req.query.page);
    const [allTasksResponse, pagedTasksResponse] = await Promise.all([
      getReindexTasks(req, undefined, 0, CASE_TYPES_FETCH_SIZE), // full list for dropdown
      getReindexTasks(req, caseType, requestedPage - 1, DEFAULT_PAGE_SIZE), // filtered list for table
    ]);
    const allTasks = Array.isArray(allTasksResponse) ? allTasksResponse : allTasksResponse.content || [];
    const filteredTasks = Array.isArray(pagedTasksResponse) ? pagedTasksResponse : pagedTasksResponse.content || [];

    const caseTypes: string[] = Array.from(
      new Set<string>(allTasks.map((t: any) => t.caseType)),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    const hasServerPagination = isPagedResponse(pagedTasksResponse);
    const tasks = (hasServerPagination ? filteredTasks : (caseType ? filteredTasks : allTasks))
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const totalItems = hasServerPagination
      ? pagedTasksResponse.totalElements || 0
      : tasks.length;
    const totalPages = hasServerPagination
      ? Math.max(1, pagedTasksResponse.totalPages || 1)
      : Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE));
    const currentPage = hasServerPagination
      ? (pagedTasksResponse.number || 0) + 1
      : Math.min(requestedPage, totalPages);
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    const paginatedTasks = hasServerPagination
      ? tasks
      : tasks.slice(startIndex, startIndex + DEFAULT_PAGE_SIZE);
    const pages = getPaginationPages(currentPage, totalPages);

    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.activePage = "reindex";
    responseContent.tasks = paginatedTasks;
    responseContent.caseTypes = caseTypes;
    responseContent.selectedCaseType = caseType || "";
    responseContent.pagination = {
      currentPage,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      nextPage: currentPage + 1,
      pages,
      previousPage: currentPage - 1,
      showPagination: totalPages > 1,
      totalItems,
      totalPages,
    };
    res.status(200).render("reindexTasks", responseContent);
  } catch (error) {
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.error = error;
    responseContent.tasks = [];
    responseContent.selectedCaseType = "";
    responseContent.pagination = {
      showPagination: false,
    };
    res.status(500).render("reindexTasks", responseContent);
  }
});

export default router;
