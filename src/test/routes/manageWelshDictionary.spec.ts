import * as chai from "chai";
import * as nock from "nock";
import * as sinonChai from "sinon-chai";
import {appTestWithAuthorizedAdminWebRoles} from "../../main/app.test-admin-web-roles-authorized";
import {
    doUploadTranslations,
    doGetWelshDictionary,
    doUploadTranslationsThen,
    doUploadTranslationsCatch,
} from "../../main/routes/manageWelshDictionary";
import * as idamServiceMock from "../http-mocks/idam";
import * as request from "supertest";

const expect = chai.expect;
chai.use(sinonChai);

describe("test route manage Welsh Dictionary", () => {

    describe("test function doUploadTranslationsThen", () => {
        const req = {
            authentication: {
                user: "",
            },
            file: {
                originalname: "dummy_filename.csv",
            },
            serviceAuthToken: "serviceAuthToken",
            session: {
                error: "",
                success: "",
            },
        };
        const expectedSuccess = "Successfully uploaded the translations from " + req.file.originalname + ".";
        const responseContent = doUploadTranslationsThen(req);
        expect(responseContent.success).to.equal(expectedSuccess);
    });

    describe("test function doUploadTranslationsCatch", () => {
        it("test function doUploadTranslationsCatch with error", () => {
            const error = {
                message: "Problems!",
                response: {
                    text: "Sort this out",
                },
                status: 500,
            };
            const req = {
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            const responseContent = doUploadTranslationsCatch(req, error);
            expect(responseContent.error.message).to.equal("Problems!");
            expect(responseContent.error.status).to.equal(500);
            expect(responseContent.error.text).to.equal("Sort this out");
        });

        it("test function doUploadTranslationsCatch without error", () => {
            const error = {};
            const req = {
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            const responseContent = doUploadTranslationsCatch(req, error);
            expect(responseContent.error.message).to.equal("Bad Request");
            expect(responseContent.error.status).to.equal(400);
            expect(responseContent.error.text).to.equal("An error occurred on import");
        });
    });

    describe("test function doUploadTranslations", () => {
        it("test function doUploadTranslations with no file", () => {
            const res = "";
            const req = {
                authentication: {
                    user: "",
                },
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            doUploadTranslations(req, res);
        });
        it("test function doUploadTranslations with a CSV file", () => {
            const res = "";
            const req = {
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.csv",
                },
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            doUploadTranslations(req, res);
        });
        it("test function doUploadTranslations without a CSV file", () => {
            const res = "";
            const req = {
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            doUploadTranslations(req, res);
        });
    });

    describe("test function doGetWelshDictionary", () => {
        it("doGetWelshDictionary with Page", () => {
            const req = {
                adminWebAuthorization: "testAuth",
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                query: {
                    page: "test_page.html",
                },
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            const adminWebAuthorization = "testAuth";
            const responseContent = doGetWelshDictionary(req);
            expect(responseContent.adminWebAuthorization).to.equal(adminWebAuthorization);
        });

        it("doGetWelshDictionary without Page", () => {
            const req = {
                adminWebAuthorization: "testAuth",
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                query: {},
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: "",
                    success: "",
                },
            };
            const adminWebAuthorization = "testAuth";
            const responseContent = doGetWelshDictionary(req);
            expect(responseContent.adminWebAuthorization).to.equal(adminWebAuthorization);
        });

        it("doGetWelshDictionary without Page without Error", () => {
            const req = {
                adminWebAuthorization: "testAuth",
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                query: {},
                serviceAuthToken: "serviceAuthToken",
                session: {
                    success: "",
                },
            };
            const adminWebAuthorization = "testAuth";
            const responseContent = doGetWelshDictionary(req);
            expect(responseContent.adminWebAuthorization).to.equal(adminWebAuthorization);
        });

        it("doGetWelshDictionary with Session Error", () => {
            const req = {
                adminWebAuthorization: "testAuth",
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                query: {},
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: {
                        test1: "test 1",
                        test2: "test 2",
                        test3: "test 3",
                    },
                    success: "",
                },
            };
            const adminWebAuthorization = "testAuth";
            const responseContent = doGetWelshDictionary(req);
            expect(responseContent.adminWebAuthorization).to.equal(adminWebAuthorization);
            expect(responseContent.error.test1).to.equal("test 1");
        });

        it("doGetWelshDictionary with empty Session Error", () => {
            const req = {
                adminWebAuthorization: "testAuth",
                authentication: {
                    user: "",
                },
                file: {
                    originalname: "dummy_filename.xslx",
                },
                query: {},
                serviceAuthToken: "serviceAuthToken",
                session: {
                    error: {},
                    success: "",
                },
            };
            const adminWebAuthorization = "testAuth";
            const responseContent = doGetWelshDictionary(req);
            expect(responseContent.adminWebAuthorization).to.equal(adminWebAuthorization);
        });
    });

    describe("on POST /manageWelshDictionary", () => {
        const CCD_IMPORT_ROLE = "ccd-import";
        beforeEach(() => {
            nock.cleanAll();
        });

        it("should respond with Welsh Translation response when NO authorisation", () => {
            const req = {
                accessToken: "userAuthToken",
                file: {
                    buffer: new Buffer(8),
                    originalname: "dummy_filename.csv",
                },
                serviceAuthToken: "serviceAuthToken",
            };
            // tslint:disable-next-line:prefer-const
            let res;
            // tslint:disable-next-line:prefer-const
            let next;
            return request(appTestWithAuthorizedAdminWebRoles)
                .post("/manageWelshDictionary")
                .send({req, res, next})
                .set("Cookie", "accessToken=ey123.ey456")
                // tslint:disable-next-line:no-shadowed-variable
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                });
        });

        it("should return Entry page when authenticated and authorized", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();
            const req = {
                accessToken: "userAuthToken",
                file: {
                    buffer: new Buffer(8),
                    originalname: "dummy_filename.xslx",
                },
                serviceAuthToken: "serviceAuthToken",
            };
            nock("http://localhost:4451")
                .get("/api/idam/adminweb/authorization")
                .reply(200, {});
            // tslint:disable-next-line:prefer-const
            let res;
            // tslint:disable-next-line:prefer-const
            let next;
            return request(appTestWithAuthorizedAdminWebRoles)
                .post("/manageWelshDictionary")
                .send({req, res, next})
                .set("Cookie", "accessToken=ey123.ey456")
                // tslint:disable-next-line:no-shadowed-variable
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                });
        });

        // it("should return Updated page when authenticated and authorised", () => {
        //     idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        //     idamServiceMock.resolveRetrieveServiceToken();
        //     const req = {
        //         accessToken: "userAuthToken",
        //         file: {
        //             buffer: new Buffer(8),
        //             originalname: "dummy_filename.csv",
        //         },
        //         serviceAuthToken: "serviceAuthToken",
        //     };
        //     nock("http://localhost:4451")
        //         .get("/api/idam/adminweb/authorization")
        //         .reply(200, {});
        //     // tslint:disable-next-line:prefer-const
        //     let res;
        //     // tslint:disable-next-line:prefer-const
        //     let next;
        //     return request(appTestWithAuthorizedAdminWebRoles)
        //         .post("/manageWelshDictionary")
        //         .send({req, res, next})
        //         .set("Cookie", "accessToken=ey123.ey456")
        //         // tslint:disable-next-line:no-shadowed-variable
        //         .then((res) => {
        //             expect(res.statusCode).to.equal(200);
        //         });
        // });

        it("should respond with Not CSV error when authenticated and authorized", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();
            const req = {
                accessToken: "userAuthToken",
                adminWebAuthorization: {
                    canLoadWelshTranslation: false,
                    canManageWelshTranslation: false,
                },
                file: {
                    buffer: new Buffer(8),
                    originalname: "dummy_filename.xslx",
                },
                serviceAuthToken: "serviceAuthToken",
            };
            nock("http://localhost:4451")
                .get("/api/idam/adminweb/authorization")
                .reply(200, {});
            // tslint:disable-next-line:prefer-const
            let res;
            // tslint:disable-next-line:prefer-const
            let next;
            return request(appTestWithAuthorizedAdminWebRoles)
                .post("/manageWelshDictionary")
                .send({req, res, next})
                .set("Cookie", "accessToken=ey123.ey456")
                // tslint:disable-next-line:no-shadowed-variable
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                });
        });

        it("should respond with Welsh Translation response when authenticated and authorized", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();
            const req = {
                accessToken: "userAuthToken",
                file: {
                    buffer: new Buffer(8),
                    originalname: "dummy_filename.csv",
                },
                serviceAuthToken: "serviceAuthToken",
            };
            nock("http://localhost:4451")
                .get("/api/idam/adminweb/authorization")
                .reply(200, {});
            // tslint:disable-next-line:prefer-const
            let res;
            // tslint:disable-next-line:prefer-const
            let next;
            return request(appTestWithAuthorizedAdminWebRoles)
                .post("/manageWelshDictionary")
                .send({req, res, next})
                .set("Cookie", "accessToken=ey123.ey456")
                // tslint:disable-next-line:no-shadowed-variable
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                });
        });
    });

    describe("on GET /manageWelshDictionary", () => {
        const CCD_IMPORT_ROLE = "ccd-import";
        beforeEach(() => {
            nock.cleanAll();
        });

        idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        idamServiceMock.resolveRetrieveServiceToken();
        nock("http://localhost:4451")
            .get("/api/idam/adminweb/authorization")
            .reply(200, {});
        it("should respond with Welsh Translation csvfile response when authenticated and authorized", () => {
            return request(appTestWithAuthorizedAdminWebRoles)
                .get("/manageWelshDictionary")
                .send({
                    currentJurisdiction: "TEST",
                    description: "Test draft",
                    version: 1,
                })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res: { statusCode: any; }) => {
                    expect(res.statusCode).to.equal(200);
                });
        });

        // it("should respond with Welsh Translation csvfile response when NOT authenticated and NOT authorized", () => {
        //     return request(null)
        //         .get("/manageWelshDictionary")
        //         .send({
        //             currentJurisdiction: "TEST",
        //             description: "Test draft",
        //             version: 1,
        //         })
        //         .set("Cookie", "accessToken=ey123.ey456")
        //         .then((res: { statusCode: any; }) => {
        //             expect(res.statusCode).to.equal(200);
        //         });
        // });

        it("should respond with Welsh Translation csvfile response when NOT authenticated and NOT authorized", () => {
            return request(appTestWithAuthorizedAdminWebRoles)
                .get("/manageWelshDictionary")
                .send({
                    adminWebAuthorization: {
                        canLoadWelshTranslation: false,
                        canManageWelshTranslation: false,
                    },
                    currentJurisdiction: "TEST",
                    description: "Test draft",
                    version: 1,
                })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res: { statusCode: any; }) => {
                    expect(res.statusCode).to.equal(200);
                });
        });
    });
});
