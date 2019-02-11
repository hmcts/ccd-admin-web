export function deleteSessionVariables(req: any) {
  delete req.session.response;
  delete req.session.error;
  delete req.session.success;
}
