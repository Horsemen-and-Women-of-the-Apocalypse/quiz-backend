import chai from "chai";
import { before, beforeEach, describe, it } from "mocha";
import { ObjectID } from "mongodb";
import { database } from "../../../src";
import { Player } from "../../../src/models/player";
import QuizService from "../../../src/services/db/quiz";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import io from "socket.io-client";
import { createLobby } from "../../common/utils";
import { parseJSONResponse } from "../../test-utils/http";
import { SERVER_URL, LOBBY_INFORMATION_ROUTE, LOBBY_JOIN_ROUTE } from "../../test-utils/server";
import WebsocketService from "../../../src/services/ws";

let lobby;
let quizService;
let lobbyService;

describe("LobbyAPI", () => {
    let lobbyId;

    before(async () => {
        quizService = new QuizService(database);
        lobbyService = new LobbyDbService(database, quizService);
    });

    beforeEach(async () => {
        // Reset collections
        await lobbyService.dropCollection();
        await quizService.dropCollection();

        lobby = createLobby();
        await quizService.addQuiz(lobby.quiz);
        lobbyId = await lobbyService.addLobby(lobby);
    });

    describe("/lobby/:id/join", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed identifier", async () => {
            const response1 = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: [] });
            chai.assert.equal(response1.status, 500);
            
            const response2 = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });

        it("Return an error because of unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(new ObjectID().toString())).send({ playerName: "Bob" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of player name already used in the lobby", async () => {
            const lobbyPlayerName = lobby.players[0].name;
            const response = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: lobbyPlayerName });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of already started game", async () => {
            lobby.start();
            await lobbyService.updateLobyStartDate(lobby);

            const response = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: "Bob" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of ended game", async () => {
            lobby.start();
            await lobbyService.updateLobyStartDate(lobby);

            lobby.end();
            await lobbyService.updateLobyEndDate(lobby);

            const response = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: "Bob" });

            chai.assert.equal(response.status, 500);
        });

        it("Join an available lobby", async () => {
            const playerName = "Bob";

            const beforeDbLobby = await lobbyService.findById(lobbyId);

            // Add owner to listening
            const socket = io(SERVER_URL, {
                path: WebsocketService.RELATIVE_PATH,
                query: {
                    lobbyId: lobbyId,
                    playerId: beforeDbLobby.owner.id,
                }
            });

            const socketResponse = await new Promise(async (resolve) => {
                // Check lobby notification
                socket.on("notify lobby", (arg) => {
                    chai.assert.equal(arg, playerName);
                    resolve(true);
                });
                socket.on("error", resolve);
                const response = await chai.request(SERVER_URL).put(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: playerName });
                
                chai.assert.equal(response.status, 200);
                const dbLobby = await lobbyService.findById(lobbyId);
                const addedPlayer = dbLobby.players.find(item => item.name === playerName);
                chai.assert.instanceOf(addedPlayer, Player);
                chai.assert.equal(parseJSONResponse(response).data.playerId, addedPlayer.id);
            });
            chai.assert.isTrue(socketResponse === true);
            socket.close();
        });
    });

    describe("/lobby/:id/info", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_INFORMATION_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed identifiers", async () => {
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
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => { return item.name; }));
        });

        it("Retrieve lobby information for the owner", async () => {
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
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => { return item.name; }));
        });
    });
});