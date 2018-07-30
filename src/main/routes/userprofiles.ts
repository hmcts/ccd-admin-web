
import { fetchUserProfilesByJurisdiction } from "../service/user.profiles.service";
import { Validator } from "../validators/validate";

const router = require("../routes/home");

// Validate
function validate(req, res, next) {
  const jurisdictionName = new Validator(req.body.jurisdictionName);
  if (jurisdictionName.isEmpty()) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction");
  } else {
    next();
  }
}

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {

  fetchUserProfilesByJurisdiction(req).then((response) => {
    res.status(201);
    const responseContent: { [k: string]: any } = {};
    responseContent.userprofiles = JSON.parse(response);
    res.render("jurisdictions", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET */
router.get("/userprofiles", (req, res, next) => {

  //  if (req.session.userprofiles) {
  //    res.render("jurisdictions", req.session.userprofiles);
  //  } else {
  // if (req.session.userprofiles === undefined) {
  req.session.userprofiles = {
    userprofiles: [{
      id: "ID_1",
      work_basket_default_case_type: "Case Type 1",
      work_basket_default_jurisdiction: "Jurisdiction 1",
      work_basket_default_state: "State 1",
    },
    {
      id: "ID_2",
      work_basket_default_case_type: "Case Type 2",
      work_basket_default_jurisdiction: "Jurisdiction 2",
      work_basket_default_state: "State 2",
    },
    {
      id: "ID_3",
      work_basket_default_case_type: "Case Type 3",
      work_basket_default_jurisdiction: "Jurisdiction 3",
      work_basket_default_state: "State 3",
    },
    {
      id: "ID_4",
      work_basket_default_case_type: "Case Type 4",
      work_basket_default_jurisdiction: "Jurisdiction 4",
      work_basket_default_state: "State 4",
    },
    {
      id: "ID_5",
      work_basket_default_case_type: "Case Type 5",
      work_basket_default_jurisdiction: "Jurisdiction 5",
      work_basket_default_state: "State 5",
    },
    {
      id: "ID_6",
      work_basket_default_case_type: "Case Type 6",
      work_basket_default_jurisdiction: "Jurisdiction 6",
      work_basket_default_state: "State 6",
    },
    {
      id: "ID_7",
      work_basket_default_case_type: "Case Type 7",
      work_basket_default_jurisdiction: "Jurisdiction 7",
      work_basket_default_state: "State 7",
    }],
  };
  //  }

  /*
   * KEEP THIS TO UNDO WHEN IMPLEMNTING PAGINATION
  const currentPageIndex = req.query.page ? req.query.page : 0;
  const pages = paginate(req.session.userprofiles.userprofiles, 2);

  const payload = {
    allowedLinks: this.allowedLinks,
    currentpage: pages[currentPageIndex],
    index: currentPageIndex,
    numberoflinks: pages.length > 1 ? pages.length : 1,
    perpage: 2,
  };
  res.render("jurisdictions", payload);
 */
  console.log(req.session.userprofiles);
  res.render("jurisdictions", req.session.userprofiles);

});

/*
 * Keep this to undo when implementing pagination
 * function paginate(records: any, recordsPerpage: number) {
  let count: number = 0;
  let generatePaginatedArray = new Array();
  const result = new Array();
  for (const entry of records) {
    if (count < recordsPerpage) {
      generatePaginatedArray.push(entry);
    } else {
      result.push(generatePaginatedArray);
      count = 0;
      generatePaginatedArray = new Array();
      generatePaginatedArray.push(entry);
    }
    count++;
  }
  result.push(generatePaginatedArray);
  console.log(result);
  return result;
}

<!-- for html footer
  {% for i in range(0, numberoflinks) -%}
    {% if (i != index) -%}
      <a href="/userprofiles?page={{ i }}">
      {{ i + 1}}
      </a>,
    {% else %}
      {{ i + 1}},
    {%- endif %}
  {%- endfor %} -->
*/
/* tslint:disable:no-default-export */
export default router;
