// import { assert } from "chai";
import { describe, test } from "mocha";
// import LobbyService from "../../../src/services/lobby/lobbyService";
// import QuizService from "../../../src/services/quiz/QuizService";
// import { database } from "../../../src";
// import { createLobby } from "../../common/utils";

// A besoin que la collection des quiz soit déjà créée dans la BDD
describe("LobbyService", () => {

    test("Should add a quiz to DataBase", async () => {
        // const quizService = new QuizService(database);
        // const lobbyService = new LobbyService(database, quizService);
        // await lobbyService.dropCollection();

        // const l1 = createLobby();
        // const l2 = createLobby();
        // const l3 = createLobby();

        // const allLobby1 = await lobbyService.getAllLobby();
        // assert.equal(allLobby1.length, 0);

        // assert.isNull(l1.id);
        // let newId = await lobbyService.addLobby(l1);
        // assert.isNotNull(l1.id);
        // assert.equal(l1.id, newId);

        // await lobbyService.addLobby(l2);
        // await lobbyService.addLobby(l3);

        // assert.notEqual(l1.id, l2.id);
        // assert.notEqual(l2.id, l3.id);

        // const allLobby2 = await lobbyService.getAllLobby();
        // assert.equal(allLobby2.length, 3);
    });

    test("Sould load all the lobby", async () => {
        // const quizService = new QuizService(database);
        // const lobbyService = new LobbyService(database, quizService);
        // await lobbyService.dropCollection();

        // let allLobby = await lobbyService.getAllLobby();
        // assert.isTrue(Array.isArray(allLobby));
        // // Reset DataBase
        // await quizService.dropCollection();

        // let quiz = await quizService.findById();

        // assert.deepEqual(quiz, null);
    });
});
