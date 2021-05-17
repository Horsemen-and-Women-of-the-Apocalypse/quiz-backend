import { assert } from "chai";
import { describe, it } from "mocha";
import { Player } from "../../src/models/player";

describe("Lobby", () => {
    describe("#Constructor", () => {

        it("Should be initialized properly", () => {
            const pName = "TOTO";
            const p = new Player(pName);

            assert.equal(p.name, pName);
        });


        describe("Should fail with wrong inputs", () => {
            it("# name", () => {
                assert.throws(() => {
                    new Player("");
                }, Error, "The player name should not be empty");
                assert.throws(() => {
                    new Player(undefined);
                }, Error, "Expected a string for parameter 'name'");
            });
        });
    });
});