import { assert } from "chai";
import { describe, it } from "mocha";
import { Route } from "../../src/router/route";
import { init } from "../../src/router/router";

class MockedApp {
    constructor() {
        this.routes = [];
        this._router = {
            stack: []
        };
    }

    get(generateRoute, callback) {
        this.routes.push(new Route(generateRoute, "get", callback));
    }

    put(generateRoute, callback) {
        this.routes.push(new Route(generateRoute, "put", callback));
    }

    post(generateRoute, callback) {
        this.routes.push(new Route(generateRoute, "put", callback));
    }
}

describe("Router", () => {
    describe("#init()", () => {
        it("Should initialize expected routes", () => {
            let app = new MockedApp();

            init(app, undefined, __dirname + "/" + "test_routes");

            assert.lengthOf(app.routes, 4);
            assert.includeDeepMembers([ "/", "/1/3", "/1", "/1/sub" ], app.routes.map(r => r.route));
        });

        it("Should throw an exception", () => {
            let app = new MockedApp();

            assert.throws(() => init(app, undefined, __dirname + "/" + "test_routes_error"), Error, "Unknown HTTP method");
        });
    });
});
