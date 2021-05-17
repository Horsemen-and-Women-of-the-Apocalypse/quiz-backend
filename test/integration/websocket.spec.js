import chai from "chai";
import { describe, it } from "mocha";
import io from "socket.io-client";
import { AUTH } from "../../src/common/apierrors";
import WebsocketService from "../../src/services/ws";
import { SERVER_URL } from "../test-utils/server";

describe("API", () => {
    describe("Websocket", () => {
        it("Connection without credentials should throw an error", async () => {
            const socket = io(SERVER_URL, { path: WebsocketService.RELATIVE_PATH });

            // Wait response
            const response = await new Promise((resolve) => {
                socket.on("connect", resolve);
                socket.on("error", resolve);
            });
            socket.close();

            chai.assert.equal(response, AUTH.ACCESS_DENIED, "Connection response should be " + AUTH.ACCESS_DENIED);
        });
    });
});
