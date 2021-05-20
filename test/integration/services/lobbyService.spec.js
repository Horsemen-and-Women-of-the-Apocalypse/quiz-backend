import { assert } from "chai";
import { describe, test, beforeEach } from "mocha";
import LobbyDbService from "../../../src/services/db/lobbyDbService";
import QuizService from "../../../src/services/db/quiz";
import { database } from "../../../src";
import { createLobby } from "../../common/utils";
import { Lobby } from "../../../src/models/lobby";
import { Player } from "../../../src/models/player";
import { isMoment } from "../../../src/utils/dates";
import { ObjectID } from "mongodb";

let quizService;
let lobbyDbService;

describe("LobbyDbService", () => {
    beforeEach(async ()=>{
        quizService = new QuizService(database);
        await quizService.dropCollection();
        lobbyDbService = new LobbyDbService(database, quizService);
        await lobbyDbService.dropCollection();
    });

    test("Should add and load lobby from the DataBase", async () => {
        const l1 = createLobby();
        const l2 = createLobby();
        const l3 = createLobby();

        await quizService.addQuiz(l1.quiz);
        await quizService.addQuiz(l2.quiz);
        await quizService.addQuiz(l3.quiz);

        // Lobby insertion
        let allLobby = await lobbyDbService.getAllLobby();
        assert.isEmpty(allLobby);

        assert.isNull(l1.id);
        let newId = await lobbyDbService.addLobby(l1);
        assert.isNotNull(l1.id);
        assert.equal(l1.id, newId);

        // Load and test the inserted lobby
        allLobby = await lobbyDbService.getAllLobby();
        assert.equal(allLobby.length, 1);
        assert.instanceOf(allLobby[0], Lobby);
        delete l1.quiz._id;
        delete allLobby[0].quiz._id;
        assert.deepEqual(allLobby[0], l1);


        // Add more lobby
        await lobbyDbService.addLobby(l2);
        await lobbyDbService.addLobby(l3);

        assert.notEqual(l1.id, l2.id);
        assert.notEqual(l2.id, l3.id);

        allLobby = await lobbyDbService.getAllLobby();
        assert.equal(allLobby.length, 3);
    });
    test("Should be able to find by ID", async () => {
        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        let newId = await lobbyDbService.addLobby(l1);

        // Find by id
        let myLobby = await lobbyDbService.findById(newId);
        assert.instanceOf(myLobby, Lobby);
        assert.equal(l1.id, myLobby.id);

        // Find of something that doesn't exist
        assert.isNull(await lobbyDbService.findById(new ObjectID()));
    });
    test("Should be able to start and end", async () => {
        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        await lobbyDbService.addLobby(l1);

        // Start lobby
        l1.start();
        await lobbyDbService.updateLobyStartDate(l1);

        assert.isNotNull(l1.startDate);
        assert.isNull(l1.endDate);

        // Find altered lobby
        let myLobby = await lobbyDbService.findById(l1.id);

        assert.isNotNull(myLobby.startDate);
        assert.isNull(myLobby.endDate);

        // End lobby
        l1.end();
        await lobbyDbService.updateLobyEndDate(l1);

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
        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        await lobbyDbService.addLobby(l1);

        // Add player lobby
        let p1 = new Player("momo");
        l1.addPlayer(p1);
        await lobbyDbService.addPlayersToLobby(l1, p1);

        // Find altered lobby
        let myLobby = await lobbyDbService.findById(l1.id);
        let myPlayer = myLobby.players.find(p => p.id === p1.id);
        assert.instanceOf(myPlayer, Player);
        assert.equal(myPlayer.id, p1.id);
    });
    test("Players Should be able to add answers", async () => {
        const l1 = createLobby();
        await quizService.addQuiz(l1.quiz);

        // Lobby insertion
        await lobbyDbService.addLobby(l1);

        // Add player lobby
        let p1 = new Player("momo");
        l1.addPlayer(p1);
        await lobbyDbService.updateLobyPlayerAnswers(l1, p1, [ "toto", "tata" ]);

        // Find altered lobby
        let myLobby = await lobbyDbService.findById(l1.id);
        assert.isTrue(p1.id in myLobby.answersByPlayerId);
        assert.deepEqual(myLobby.answersByPlayerId[p1.id], [ "toto", "tata" ]);

    });
});
