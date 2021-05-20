import { before, beforeEach, describe, it } from "mocha";
import chai, { assert } from "chai";
import { ObjectID } from "mongodb";
import { database } from "../../../src";
import { Player } from "../../../src/models/player";
import QuizService from "../../../src/services/db/quiz";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import io from "socket.io-client";
import { createLobby } from "../../common/utils";
import { parseJSONResponse } from "../../test-utils/http";
import WebsocketService from "../../../src/services/ws";
import { SERVER_URL, LOBBY_INFORMATION_ROUTE, LOBBY_JOIN_ROUTE, LOBBY_POST_ANSWER_ROUTE, LOBBY_CREATE_ROUTE, LOBBY_QUESTIONS_ROUTE } from "../../test-utils/server";
import { Lobby } from "../../../src/models/lobby";

let lobby;
let quizService;
let lobbyService;

describe("LobbyAPI", () => {
    let lobbyId;
    let quizId;

    before(() => {
        quizService = new QuizService(database);
        lobbyService = new LobbyDbService(database, quizService);
    });

    beforeEach(async () => {
        // Reset collections
        await lobbyService.dropCollection();
        await quizService.dropCollection();

        lobby = createLobby();
        await quizService.addQuiz(lobby.quiz);

        quizId = await quizService.addQuiz(lobby.quiz);
        lobbyId = await lobbyService.addLobby(lobby);
    });

    describe("/lobby/:id/join", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed identifier", async () => {
            const response1 = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: [] });
            chai.assert.equal(response1.status, 500);

            const response2 = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(lobbyId)).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });

        it("Return an error because of unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(new ObjectID().toString())).send({ playerName: "Bob" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of already started game", async () => {
            lobby.start();
            await lobbyService.updatelobbyStartDate(lobby);

            const response = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: "Bob" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of ended game", async () => {
            lobby.start();
            await lobbyService.updatelobbyStartDate(lobby);

            lobby.end();
            await lobbyService.updatelobbyEndDate(lobby);

            const response = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: "Bob" });

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
                socket.on("playerHasJoined", (arg) => {
                    chai.assert.equal(arg, playerName);
                    resolve(true);
                });
                socket.on("error", resolve);
                const response = await chai.request(SERVER_URL).post(LOBBY_JOIN_ROUTE(lobbyId)).send({ playerName: playerName });

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
            const response = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed answers", async () => {
            const response1 = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: [] });
            chai.assert.equal(response1.status, 500);

            const response2 = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });

        it("Return an error because of unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(new ObjectID().toString())).send({ playerId: "some_id" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of unauthorized user", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: "unauthorized" });

            chai.assert.equal(response.status, 500);
        });

        it("Retrieve lobby information for a player", async () => {
            const dbLobby = await lobbyService.findById(lobbyId);
            const players = dbLobby.players;

            const owner = dbLobby.owner;

            // Test for player
            const playerId = players.find(item => item.id !== owner.id).id;
            const response = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: playerId });

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
            const response = await chai.request(SERVER_URL).post(LOBBY_INFORMATION_ROUTE(lobbyId)).send({ playerId: owner.id });

            chai.assert.equal(response.status, 200);

            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.id, lobbyId);
            chai.assert.equal(json.name, lobby.name);
            chai.assert.equal(json.quizName, lobby.quiz.name);
            chai.assert.equal(json.ownerName, lobby.owner.name);
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => { return item.name; }));
        });
    });
    describe("/lobby/:lobby_id/player/:player_id/answer", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, lobby.owner.id)).send();

            chai.assert.equal(response.status, 500);
        });
        it("Send malformed answers", async () => {
            const response1 = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, lobby.owner.id)).send({ answers: "Hello" });
            chai.assert.equal(response1.status, 500);

            const response2 = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, lobby.owner.id)).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });
        it("Return an error because of unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(new ObjectID().toString(), new ObjectID().toString())).send({ answers: [] });
            chai.assert.equal(response.status, 500);
        });
        it("Return an error because of unauthorized user", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, new ObjectID().toString())).send({ answers: [] });
            chai.assert.equal(response.status, 500);
        });
        it("Add answers for the owner", async () => {
            const dbLobby = await lobbyService.findById(lobbyId);

            const response = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, dbLobby.owner.id)).send({ answers: [ "a", "b", "c" ] });
            chai.assert.equal(response.status, 200);

            const dbLobby2 = await lobbyService.findById(lobbyId);
            assert.isTrue(dbLobby.owner.id in dbLobby2.answersByPlayerId);
            assert.deepEqual(dbLobby2.answersByPlayerId[dbLobby.owner.id], [ "a", "b", "c" ]);

        });
        it("Add answers for a player", async () => {
            const dbLobby = await lobbyService.findById(lobbyId);

            const response = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, dbLobby._otherPlayers[0].id)).send({ answers: [ "a", "b", "c" ] });
            chai.assert.equal(response.status, 200);
        });
        it("A player can't add answers twice", async () => {
            const dbLobby = await lobbyService.findById(lobbyId);

            await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, dbLobby._otherPlayers[0].id)).send({ answers: [ "a", "b", "c" ] });
            const response = await chai.request(SERVER_URL).post(LOBBY_POST_ANSWER_ROUTE(lobbyId, dbLobby._otherPlayers[0].id)).send({ answers: [ "a", "b", "c" ] });
            chai.assert.equal(response.status, 500);
        });
    });

    describe("/lobby/create", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).post(LOBBY_CREATE_ROUTE).send();

            chai.assert.equal(response.status, 500);
        });
        it("Send malformed creation request", async () => {
            const response1 = await chai.request(SERVER_URL).post(LOBBY_CREATE_ROUTE).send({ playerId: [] });
            chai.assert.equal(response1.status, 500);

            const response2 = await chai.request(SERVER_URL).post(LOBBY_CREATE_ROUTE).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });
        it("Successful lobby creation", async () => {
            // Test for player
            const response = await chai.request(SERVER_URL).post(LOBBY_CREATE_ROUTE).send(
                {
                    name: "stahp",
                    quizId: quizId,
                    ownerName: "josef"
                });

            chai.assert.equal(response.status, 200);


            const json = parseJSONResponse(response).data;

            chai.assert.equal(json.name, "stahp");
            chai.assert.equal(json.owner.name, "josef");

            const dbLobby = await lobbyService.findById(json.id);
            chai.assert.instanceOf(dbLobby, Lobby);
            chai.assert.isNotNull(json.owner.id);
            chai.assert.equal(dbLobby.owner.id, json.owner.id);
            chai.assert.equal(dbLobby.owner.name, json.owner.name);

            const dbQuiz = await quizService.findById(json.quiz.id);
            chai.assert.isNotNull(json.quiz.id);
            chai.assert.equal(json.quiz.id, dbQuiz.id);
            chai.assert.equal(lobby.quiz.name, dbQuiz.name);
        });
    });
    describe("/lobby/:id/questions", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed answers", async () => {
            const response1 = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ playerId: [] });
            chai.assert.equal(response1.status, 500);

            const response2 = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ foo: "bar" });
            chai.assert.equal(response2.status, 500);
        });

        it("Return an error because of unknown lobby", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(new ObjectID().toString())).send({ playerId: lobby.players[0]._id });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because of unknown player", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ playerId: "unauthorized" });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because lobby did not start", async () => {
            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ playerId: lobby.players[0]._id });

            chai.assert.equal(response.status, 500);
        });

        it("Return an error because lobby ended", async () => {
            // Start lobby
            lobby.start();
            await lobbyService.updateLobyStartDate(lobby);

            // End lobby
            lobby.end();
            await lobbyService.updateLobyEndDate(lobby);

            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ playerId: lobby.players[0]._id });

            chai.assert.equal(response.status, 500);
        });

        it("Return all questions of a lobby already start", async () => {
            // Start lobby
            lobby.start();
            await lobbyService.updateLobyStartDate(lobby);

            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ playerId: lobby.players[0]._id });
            const expectedQuestions = lobby.quiz.questions.map(item => {
                return {
                    "question": item.question,
                    "choices": item.choices
                };
            });

            chai.assert.equal(response.status, 200);
            chai.assert.sameDeepMembers(parseJSONResponse(response).data, expectedQuestions);
        });

        it("Return an error because lobby is corrupted", async () => {
            // End lobby
            lobby.end();
            await lobbyService.updateLobyEndDate(lobby);

            const response = await chai.request(SERVER_URL).get(LOBBY_QUESTIONS_ROUTE(lobbyId)).send({ playerId: lobby.players[0]._id });

            chai.assert.equal(response.status, 500);
        });
    });
});
