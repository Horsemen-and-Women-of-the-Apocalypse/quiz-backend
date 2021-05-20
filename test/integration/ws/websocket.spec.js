import chai from "chai";
import { describe, it } from "mocha";
import io from "socket.io-client";
import { AUTH } from "../../../src/common/apierrors";
import WebsocketService from "../../../src/services/ws";
import { SERVER_URL } from "../../test-utils/server";
import { clearDatabase, insertLobby } from "../../common/utils";
import { ObjectID } from "mongodb";

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

            chai.assert.equal(response, AUTH.ACCESS_DENIED + " a playerId is required");
        });
        it("Connection with no PlayerId should throw an error", async () => {
            const socket = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH,
                query: {
                    lobbyId: "test",
                }
            });

            // Wait response
            const response = await new Promise((resolve) => {
                socket.on("connect", resolve);
                socket.on("error", resolve);
            });
            socket.close();

            chai.assert.equal(response, AUTH.ACCESS_DENIED + " a playerId is required");
        });
        it("Connection with no PlayerId should throw an error", async () => {
            const socket = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH,
                query: {
                    playerId: "test",
                }
            });

            // Wait response
            const response = await new Promise((resolve) => {
                socket.on("connect", resolve);
                socket.on("error", resolve);
            });
            socket.close();

            chai.assert.equal(response, AUTH.ACCESS_DENIED + " a lobbyId is required");
        });
        it("Connection with an non existing lobby", async () => {
            const socket = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH,
                query: {
                    lobbyId: new ObjectID(),
                    playerId: new ObjectID(),
                }
            });

            const response = await new Promise((resolve) => {
                socket.on("connect", resolve);
                socket.on("error", resolve);
            });
            socket.close();

            chai.assert.equal(response, AUTH.ACCESS_DENIED + " Lobby not found");
        });
        it("Connection with an existing lobby but no Player should throw an error", async () => {
            // Insert a quiz
            await clearDatabase();
            const l = await insertLobby();

            const socket = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH,
                query: {
                    lobbyId: l.id,
                    playerId: new ObjectID(),
                }
            });

            const response = await new Promise((resolve) => {
                socket.on("connect", resolve);
                socket.on("error", resolve);
            });
            socket.close();

            chai.assert.equal(response, AUTH.ACCESS_DENIED + " Player is not in the lobby");
        });
        it("Successfull connection schould add the the player to the lobby room", async () => {
            // Insert a quiz
            await clearDatabase();
            const l = await insertLobby();
            const socket = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH,
                query: {
                    lobbyId: l.id,
                    playerId: l.owner.id,
                }
            });

            // Test the room message
            const response = await new Promise((resolve) => {
                socket.on("newPlayer", resolve);
                socket.on("error", resolve);
            });

            socket.close();
            chai.assert.equal(response, l.owner.name);
        });
    });
});
