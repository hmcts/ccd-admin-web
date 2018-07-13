import { app } from "../../main/app";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("on Get /createuser", () => {
    it("should respond with create user form and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();

        mock("http://localhost:4451")
        .get("/api/data/jurisdictions")
        .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

        return request(app)
            .get("/createuser")
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.text).to.contain("Jurisdiction 1");
                expect(res.text).to.contain("Jurisdiction 2");
            });
    });
});
