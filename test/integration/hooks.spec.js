import chai from "chai";
import { after, before } from "mocha";
import { database, server, services, startSemaphore } from "../../src";
import { LOGGER } from "../../src/utils";

// Wait server start
before(done => {
    startSemaphore.take(() => done());

    LOGGER.info("Application ready for tests");
});

// Kill server after all tests
after(async () => {
    // Wait that there is no scheduled tasks before closing application
    while (!(await services.lobbyService.noScheduledTasks())) {
        // Do nothing
    }

    server.close();
    database.close();

    LOGGER.info("Application for tests killed");
});

// Add HTTP
chai.use(require("chai-http"));
