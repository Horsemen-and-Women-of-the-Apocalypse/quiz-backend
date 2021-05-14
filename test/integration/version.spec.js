import chai from "chai";
import fs from "fs";
import { describe, it } from "mocha";
import { parseJSONResponse } from "../test-utils/http";
import { SERVER_URL, VERSION_ROUTE } from "../test-utils/server";

const projectPackage = JSON.parse(fs.readFileSync("./package.json", "UTF-8"));

describe("API", () => {
    describe("/version", () => {
        it("Version should be " + projectPackage.version, async () => {
            const response = await chai.request(SERVER_URL).get(VERSION_ROUTE).send();

            chai.assert.equal(response.status, 200);
            chai.assert.equal(parseJSONResponse(response).data.version, projectPackage.version);
        });
    });
});
