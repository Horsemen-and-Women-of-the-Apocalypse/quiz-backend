import { assert } from "chai";
import { describe, test } from "mocha";
import LobbyService from "../../../src/services/lobby/lobbyService";
import QuizService from "../../../src/services/quiz/QuizService";
import { database } from "../../../src";
import { createLobby } from "../../common/utils";
import { Lobby } from "../../../src/models/lobby";

describe("LobbyService", () => {

    test("Should add load lobby to the DataBase", async () => {
        const quizService = new QuizService(database);
        await quizService.dropCollection();
        const lobbyService = new LobbyService(database, quizService);
        await lobbyService.dropCollection();

        const l1 = createLobby();
        const l2 = createLobby();
        const l3 = createLobby();

        await quizService.addQuiz(l1.quiz);
        await quizService.addQuiz(l2.quiz);
        await quizService.addQuiz(l3.quiz);

        // Lobby insertion
        let allLobby = await lobbyService.getAllLobby();
        assert.equal(allLobby.length, 0);

        assert.isNull(l1.id);
        let newId = await lobbyService.addLobby(l1);
        assert.isNotNull(l1.id);
        assert.equal(l1.id, newId);

        // Load and test the inserted lobby
        allLobby = await lobbyService.getAllLobby();
        assert.equal(allLobby.length, 1);
        assert.isTrue(allLobby[0] instanceof Lobby);
        assert.equal(l1._id, allLobby[0]._id);


        // Add more lobby
        await lobbyService.addLobby(l2);
        await lobbyService.addLobby(l3);

        assert.notEqual(l1.id, l2.id);
        assert.notEqual(l2.id, l3.id);

        allLobby = await lobbyService.getAllLobby();
        assert.equal(allLobby.length, 3);


    });

});
