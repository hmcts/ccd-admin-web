import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("Validate Jurisdiction", () => {

  const jurisdiction = "TEST";
  let req;
  let res;
  let next;
  let validate;

  beforeEach(() => {
    req = {
      body: {
        jurisdictionName: jurisdiction,
      },
      session: {},
    };
    res = {};
    next = sinon.stub();

    const sanitize = {
      sanitize: sinon.stub(),
    };
    sanitize.sanitize.withArgs(jurisdiction).returns(jurisdiction);

    validate = proxyquire("../../main/validators/validateJurisdiction", {
      "../util/sanitize": sanitize,
    }).validate;
  });

  it("should set the jurisdiction, from the request body, on the session", () => {
    validate(req, res, next);
    expect(req.session.jurisdiction).to.equal(jurisdiction);
    expect(next).to.be.called;
  });
});
