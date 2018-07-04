import { appTest } from "../../main/app.test";
//import { expect } from "chai";
//import { get } from "config";
//import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("User profile page", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on POST /userprofiles", () => {
    it('should perform post happy path', function (done) {

      request(appTest)
        .get('/jurisdiction')
        .end(function (err, res) {

          request(appTest)
            .post("/userprofiles")
            .send({
              jurisdictionName: 'Mike'
            })
            .expect(200, done);
        });
    });

    it('should redirect to jurisdiction page', function (done) {

      request(appTest)
        .get('/jurisdiction')
        .end(function (err, res) {
          request(appTest)
            .post("/userprofiles")
            .send({
            })
            .expect(302, done)
            .expect('location', '/jurisdiction', done)
        });
    });
  });

});
