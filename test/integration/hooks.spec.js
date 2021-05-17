import chai from "chai";
import { after, before } from "mocha";
import { server, database, startSemaphore } from "../../src";

// Wait server start
before(done => {
    startSemaphore.take(() => done());
});

// Kill server after all tests
after(() => {
    server.close();
    database.close();
});

// Add HTTP
chai.use(require("chai-http"));
