import { assert } from "chai";
import { describe, test } from "mocha";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import QuizService from "../../../src/services/quiz/QuizService";
import { database } from "../../../src";
import { createLobby } from "../../common/utils";
import { Lobby } from "../../../src/models/lobby";
import { Player } from "../../../src/models/player";
import { isMoment } from "../../../src/utils/dates";

describe("LobbyDbService", () => {

    test("Should add and load lobby from the DataBase", async () => {
        const quizService = new QuizService(database);
        await quizService.dropCollection();
        const lobbyDbService = new LobbyDbService(database, quizService);
        await lobbyDbService.dropCollection();

        const l1 = createLobby();
        const l2 = createLobby();
        const l3 = createLobby();

        await quizService.addQuiz(l1.quiz);
        await quizService.addQuiz(l2.quiz);
        await quizService.addQuiz(l3.quiz);

        // Lobby insertion
        let allLobby = await lobbyDbService.getAllLobby();
        assert.equal(allLobby.length, 0);

        assert.isNull(l1.id);
        let newId = await lobbyDbService.addLobby(l1);
        assert.isNotNull(l1.id);
        assert.equal(l1.id, newId);

        // Load and test the inserted lobby
        allLobby = await lobbyDbService.getAllLobby();
        assert.equal(allLobby.length, 1);
        assert.isTrue(allLobby[0] instanceof Lobby);
        assert.equal(l1._id, allLobby[0]._id);


        // Add more lobby
        await lobbyDbService.addLobby(l2);
        await lobbyDbService.addLobby(l3);

        assert.notEqual(l1.id, l2.id);
        assert.notEqual(l2.id, l3.id);

        allLobby = await lobbyDbService.getAllLobby();
        assert.equal(allLobby.length, 3);
    });
    test("Should be able to find by ID", async () => {
        const quizService = new QuizService(database);
        await quizService.dropCollection();
        const lobbyDbService = new LobbyDbService(database, quizService);
        await lobbyDbService.dropCollection();

        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        let newId = await lobbyDbService.addLobby(l1);

        // Find by id
        let myLobby = await lobbyDbService.findById(newId);
        assert.isTrue(myLobby instanceof Lobby);
        assert.equal(l1.id, myLobby.id);
    });
    test("Should be able to start and end", async () => {
        const quizService = new QuizService(database);
        await quizService.dropCollection();
        const lobbyDbService = new LobbyDbService(database, quizService);
        await lobbyDbService.dropCollection();

        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        await lobbyDbService.addLobby(l1);

        // Start lobby
        await lobbyDbService.startLobby(l1);

        assert.isNotNull(l1.startDate);
        assert.isNull(l1.endDate);

        // Find altered lobby
        let myLobby = await lobbyDbService.findById(l1.id);

        assert.isNotNull(myLobby.startDate);
        assert.isNull(myLobby.endDate);

        // End lobby
        await lobbyDbService.endLobby(l1);

        assert.isNotNull(l1.startDate);
        assert.isNotNull(l1.endDate);

        // Find altered lobby
        let myLobby2 = await lobbyDbService.findById(l1.id);
        assert.isNotNull(myLobby2.startDate);
        assert.isNotNull(myLobby2.endDate);

        assert.isTrue(isMoment(myLobby2.startDate));
        assert.isTrue(isMoment(myLobby2.endDate));

    });
    test("Players Should be able to join", async () => {
        const quizService = new QuizService(database);
        await quizService.dropCollection();
        const lobbyDbService = new LobbyDbService(database, quizService);
        await lobbyDbService.dropCollection();

        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        await lobbyDbService.addLobby(l1);

        // Add player lobby
        let p1 = new Player("momo");
        await lobbyDbService.playerJoin(l1, p1);

        // Find altered lobby
        let myLobby = await lobbyDbService.findById(l1.id);
        let myPlayer = myLobby.players.find(p => p.id === p1.id);
        assert.isTrue(myPlayer instanceof Player);
        assert.equal(myPlayer.id, p1.id)

    });

});
