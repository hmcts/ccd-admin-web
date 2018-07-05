import { appTest } from "../../main/app.test";

import * as mock from "nock";
import * as request from "supertest";

describe("User profile page", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on POST /userprofiles", () => {
    it("should perform post happy path", (done) => {

      request(appTest)
        .get("/jurisdiction")
        .end((err, res) => {

          request(appTest)
            .post("/userprofiles")
            .send({ jurisdictionName: "Mike" })
            .expect(200, done);
        });
    });

    it("should redirect to jurisdiction page", (done) => {

      request(appTest)
        .get("/jurisdiction")
        .end((err, res) => {
          request(appTest)
            .post("/userprofiles")
            .send({
            })
            .expect(302, done)
            .expect("location", "/jurisdiction", done);
        });
    });
  });

});
