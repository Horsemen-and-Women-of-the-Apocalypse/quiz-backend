import chai from "chai";
import { before, beforeEach, describe, it } from "mocha";
import { ObjectID } from "mongodb";
import { database } from "../../../src";
import QuizService from "../../../src/services/db/quiz";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import { createLobby } from "../../common/utils";
import { parseJSONResponse } from "../../test-utils/http";
import { SERVER_URL, LOBBY_INFORMATION_ROUTE, LOBBY_QUESTIONS_ROUTE } from "../../test-utils/server";

let quizService;
let lobbyService;
let lobby;

describe("LobbyAPI", () => {
    let lobbyId;

    before(() => {
        quizService = new QuizService(database);
        lobbyService = new LobbyDbService(database, quizService);
    });
    
    beforeEach(async () => {
        lobby = createLobby();

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
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => { return item.name; }));
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
            chai.assert.sameMembers(json.playerNames, lobby.players.map(item => { return item.name; }));
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
