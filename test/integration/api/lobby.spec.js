import chai, { assert } from "chai";
import { before, describe, it } from "mocha";
import { ObjectID } from "mongodb";
import { database } from "../../../src";
import QuizService from "../../../src/services/db/quiz";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import { createLobby } from "../../common/utils";
import { parseJSONResponse } from "../../test-utils/http";
import { SERVER_URL, LOBBY_INFORMATION_ROUTE, LOBBY_POST_ANSWER_ROUTE } from "../../test-utils/server";

const lobby = createLobby();
let quizService;
let lobbyService;

describe("LobbyAPI", () => {
    let lobbyId;

    before(async () => {
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
});
