import chai from "chai";
import { beforeEach, describe, it } from "mocha";
import { ObjectID } from "mongodb";
import Semaphore from "semaphore";
import io from "socket.io-client";
import { database } from "../../../src";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import QuizService from "../../../src/services/db/quiz";
import { EVENTS, WebsocketService } from "../../../src/services/ws";
import { createLobby } from "../../common/utils";
import { parseJSONResponse } from "../../test-utils/http";
import { LOBBY_INFORMATION_ROUTE, LOBBY_START_ROUTE, SERVER_URL } from "../../test-utils/server";

const lobby = createLobby();

describe("LobbyAPI", () => {
    let lobbyId;
    let quizService;
    let lobbyService;

    beforeEach(async () => {
        quizService = new QuizService(database);
        lobbyService = new LobbyDbService(database, quizService);

        // Reset collections
        await lobbyService.dropCollection();
        await quizService.dropCollection();

        await quizService.addQuiz(lobby.quiz);

        lobbyId = await lobbyService.addLobby(lobby);
    });

    describe("/lobby/:id/info", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed answers", async () => {
            const response1 = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: [] });
            chai.assert.equal(response1.status, 500);

            const response2 = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });

        it("Return an error because of unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(new ObjectID().toString())).send({ playerId: "some_id" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of unauthorized user", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: "unauthorized" });

            chai.assert.equal(response.status, 500);
        });

        it("Retrieve lobby information for a player", async () => {
            const dbLobby = await lobbyService.findById(lobbyId);
            const players = dbLobby.players;

            const owner = dbLobby.owner;

            // Test for player
            const playerId = players.find(item => item.id !== owner.id).id;
            const response = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: playerId });

            chai.assert.equal(response.status, 200);

            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.id, lobbyId);
            chai.assert.equal(json.name, lobby.name);
            chai.assert.equal(json.quizName, lobby.quiz.name);
            chai.assert.equal(json.ownerName, lobby.owner.name);
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => {
                return item.name;
            }));
        });

        it("Retrieve lobby informations for the owner", async () => {
            const dbLobby = await lobbyService.findById(lobbyId);
            const owner = dbLobby.owner;

            // Test for owner
            const response = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: owner.id });

            chai.assert.equal(response.status, 200);

            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.id, lobbyId);
            chai.assert.equal(json.name, lobby.name);
            chai.assert.equal(json.quizName, lobby.quiz.name);
            chai.assert.equal(json.ownerName, lobby.owner.name);
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => {
                return item.name;
            }));
        });
    });

    describe("/lobby/:id/start", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed payload", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(lobbyId)).send({ playerId: [] });

            chai.assert.equal(response.status, 500);
        });

        it("Start an unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(new ObjectID())).send({ playerId: "id" });

            chai.assert.equal(response.status, 500);
        });

        it("Start lobby with an unknown player", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(lobbyId)).send({ playerId: "id" });

            chai.assert.equal(response.status, 500);
        });

        it("Start lobby with owner", async () => {
            let ownerStartEvent = null;
            const ownerEndEventSem = Semaphore(1);
            ownerEndEventSem.take(() => {
            });

            let playerStartEvent = null;
            const playerEndEventSem = Semaphore(1);
            playerEndEventSem.take(() => {
            });

            // Connect owner and a player to socket
            const ownerClient = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH, query: {
                    lobbyId: lobbyId,
                    playerId: lobby.owner.id,
                }
            });
            ownerClient.on(EVENTS.LOBBY_START, () => ownerStartEvent = "OK");
            ownerClient.on(EVENTS.LOBBY_END, () => {
                ownerEndEventSem.leave();
            });
            const playerClient = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH, query: {
                    lobbyId: lobbyId,
                    playerId: lobby.players[lobby.players.length - 1].id,
                }
            });
            playerClient.on(EVENTS.LOBBY_START, () => playerStartEvent = "OK");
            playerClient.on(EVENTS.LOBBY_END, () => {
                playerEndEventSem.leave();
            });

            // Start lobby
            const response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(lobbyId)).send({ playerId: lobby.owner.id });
            chai.assert.equal(response.status, 200);

            // Wait lobby end
            await new Promise(resolve => {
                ownerEndEventSem.take(() => {
                    playerEndEventSem.take(() => {
                        resolve();
                    });
                });
            });
            ownerClient.close();
            playerClient.close();

            chai.assert.equal(ownerStartEvent, "OK");
            chai.assert.equal(playerStartEvent, "OK");
        });

        it("Start lobby which is already started", async () => {
            const lobbyEndSem = Semaphore(1);
            lobbyEndSem.take(() => {
            });

            // Connect owner to socket
            const ownerClient = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH, query: {
                    lobbyId: lobbyId,
                    playerId: lobby.owner.id,
                }
            });
            ownerClient.on(EVENTS.LOBBY_END, () => {
                lobbyEndSem.leave();
            });

            // Start lobby
            let response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(lobbyId)).send({ playerId: lobby.owner.id });
            chai.assert.equal(response.status, 200);

            // Start lobby
            response = await chai.request(SERVER_URL).post(LOBBY_START_ROUTE(lobbyId)).send({ playerId: lobby.owner.id });
            chai.assert.equal(response.status, 500);

            // Wait lobby end
            await new Promise(resolve => {
                lobbyEndSem.take(() => {
                    resolve();
                });
            });
            ownerClient.close();
        });
    });
});
