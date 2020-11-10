import { expect } from "chai";
import * as request from "supertest";
import { app } from "../../main/app";

describe("health check", () => {
  it("should return 200 OK for health check", async () => {
    await request(app)
      .get("/health")
      .expect((res) => {
        expect(res.status).equal(200);
        expect(res.body.status).equal("UP");
      });
  });

  it("should return 200 OK for liveness health check", async () => {
    await request(app)
      .get("/health/liveness")
      .expect((res) => {
        expect(res.status).equal(200);
        expect(res.body.status).equal("UP");
      });
  });

  it("should return 200 OK for readiness health check", async () => {
    await request(app)
      .get("/health/readiness")
      .expect((res) => {
        expect(res.status).equal(200);
        expect(res.body.status).equal("UP");
      });
  });
});
