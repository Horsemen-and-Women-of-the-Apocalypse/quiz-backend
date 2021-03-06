import { assert } from "chai";
import { describe, it } from "mocha";
import { generateCurrentDate } from "../../src/utils/dates";
import { createQuiz } from "../common/utils";

import { Player } from "../../src/models/player";
import { Lobby } from "../../src/models/lobby";


describe("Lobby", () => {
    describe("#Constructor", () => {
        const lobbyName = "The best lobby";
        const q = createQuiz();

        const p1 = new Player("toto");
        const p2 = new Player("tata");

        const dateStart = generateCurrentDate();
        const dateEnd = generateCurrentDate();

        const l = new Lobby(lobbyName, q, p1, [ p2 ], dateStart, { "toto": [] }, dateEnd);

        // It should work for a new lobby
        new Lobby(lobbyName, q, p1, []);

        it("Should be initialized properly", () => {
            assert.equal(l.quiz, q);
            assert.equal(l.name, lobbyName);
            assert.equal(l.owner, p1);
            // Even if p1 not inserted as players, it should be one of them:
            assert.sameMembers(l.players, [ p1, p2 ]);
        });

        describe("Should fail with wrong inputs", () => {
            it("# name", () => {
                assert.throws(() => {
                    new Lobby("", q, p1, [ p2 ]);
                }, Error, "The lobby name should not be empty");
                assert.throws(() => {
                    new Lobby(undefined, q, p1, [ p2 ]);
                }, Error, "Expected a string for parameter 'name'");
            });
            it("# quiz", () => {
                assert.throws(() => {
                    new Lobby(lobbyName, "IMNOTAQUIZ", p1, [ p2 ]);
                }, Error, "Unexpected type for the quiz");
                assert.throws(() => {
                    new Lobby(lobbyName, undefined, p1, [ p2 ]);
                }, Error, "Unexpected type for the quiz");
            });
            it("# owner", () => {
                assert.throws(() => {
                    new Lobby(lobbyName, q, "HELLOIAMOWNER", [ p2 ]);
                }, Error, "Unexpected type for the owner");
                assert.throws(() => {
                    new Lobby(lobbyName, q, undefined, [ p2 ]);
                }, Error, "Unexpected type for the owner");
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, [ p2, p1 ]);
                }, Error, "The owner should not be included in the players");
            });
            it("# players", () => {
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, "LOLLOOKATME");
                }, Error, "Expected an array for parameter 'players'");
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, [ p2, "THE SUS PLAYER" ]);
                }, Error, "Unexpected type in 'players' array");
            });
            it("# dates", () => {
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, [ p2 ], "not a date");
                }, Error, "Unexpected type for the startDate");
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, [ p2 ], generateCurrentDate(), {}, "not a date");
                }, Error, "Unexpected type for the endDate");
            });
            it("# answersByPlayerId", () => {
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, [ p2 ], generateCurrentDate(), "not obj");
                }, Error, "Expected an object for parameter 'answersByPlayerId'");
                assert.throws(() => {
                    new Lobby(lobbyName, q, p1, [ p2 ], generateCurrentDate(), { "toto" : "not an arr" });
                }, Error, "Expected an array for the answersByPlayerId value");
            });
        });
    });
    describe("#Start & end", () => {
        const lobbyName = "The best lobby";
        const q = createQuiz();

        const p1 = new Player("toto");

        const l = new Lobby(lobbyName, q, p1, []);

        it("Should set a date on start and on end", () => {
            assert.isNull(l.startDate);
            assert.isNull(l.endDate);
            l.start();
            assert.isNotNull(l.startDate);
            assert.isNull(l.endDate);
            l.end();
            assert.isNotNull(l.startDate);
            assert.isNotNull(l.endDate);
        });
    });
});