const router = require("../routes/home");

/* GET */
router.get("/deleteitem", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.response = req.session.response;
  responseContent.itemToDelete = req.query.item;

  if (req.query.item === "user") {
    responseContent.idamId = req.query.idamId;
    responseContent.warning = `Are you sure you would like to delete user ${req.query.idamId}?`;
    responseContent.headingItem = "User Profile";
  }

  if (req.query.item === "definition") {
    responseContent.currentJurisdiction = req.query.jurisdictionId;
    responseContent.version = req.query.version;
    responseContent.warning = "Are you sure you would like to delete the selected definition?";
    responseContent.headingItem = "Definition";
  }

  if (req.session.error) {
    responseContent.error = req.session.error;
  }
  res.render("confirm-delete-item", responseContent);
});

export default router;
