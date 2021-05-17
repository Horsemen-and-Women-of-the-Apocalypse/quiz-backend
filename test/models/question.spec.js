import { assert } from "chai";
import { describe, it } from "mocha";
import { StringMultipleChoiceQuestion } from "../../src/models/question";

describe("Question", () => {
    const obj = {
        question: "What is love ?",
        choices: [ "Never gonna let you down", "Baby don't hurt me", "Hey, now, you're a rock star, get the show on, get paid" ],
        solutionIndex: 1
    };
    const testQuestion = new StringMultipleChoiceQuestion(obj.question, obj.choices, obj.solutionIndex);

    describe("#Constructor", () => {
        it("Should be initialized properly", () => {
            assert.equal(testQuestion.question, obj.question);
            assert.sameDeepMembers(testQuestion.choices, obj.choices);
            assert.equal(testQuestion.solutionIndex, obj.solutionIndex);
        });

        describe("", () => {
            it("#string expected for 'question'", () => {
                assert.throws(() => {
                    try {
                        const dont = new StringMultipleChoiceQuestion(12, [ 12, 12 ], 0);
                        dont.isAnswer(12);
                    } catch (err) {
                        throw(err);
                    }
                }, Error, "Expected a string for parameter 'question'");
            });
        });

        it("#'choices' must contain at least 2 elements", () => {
            assert.throws(() => {
                try {
                    const dont = new StringMultipleChoiceQuestion("12?", [ 12 ], 0);
                    dont.isAnswer(12);
                } catch (err) {
                    throw(err);
                }
            }, Error, "'choices' must contain at least 2 elements");
        });

        it("#Expected an array for parameter 'choices'", () => {
            assert.throws(() => {
                try {
                    const dont = new StringMultipleChoiceQuestion("12?", 12, 0);
                    dont.isAnswer(12);
                } catch (err) {
                    throw(err);
                }
            }, Error, "Expected an array for parameter 'choices'");
        });

        it("#Wrong value of 'solutionIndex'", () => {
            assert.throws(() => {
                try {
                    const dont = new StringMultipleChoiceQuestion("12?", [ "12", "douze" ], 12);
                    dont.isAnswer(12);
                } catch (err) {
                    throw(err);
                }
            }, Error, "Wrong value of 'solutionIndex'");
        });

        it("#Expected an integer for parameter 'solutionIndex' (1)", () => {
            assert.throws(() => {
                try {
                    const dont = new StringMultipleChoiceQuestion("12?", [ "12", "douze" ], 12.12);
                    dont.isAnswer(12);
                } catch (err) {
                    throw(err);
                }
            }, Error, "Expected an integer for parameter 'solutionIndex'");
        });

        it("#Expected an integer for parameter 'solutionIndex' (2)", () => {
            assert.throws(() => {
                try {
                    const dont = new StringMultipleChoiceQuestion("12?", [ "12", "douze" ], "12.12");
                    dont.isAnswer(12);
                } catch (err) {
                    throw(err);
                }
            }, Error, "Expected an integer for parameter 'solutionIndex'");
        });
    });

    describe("#IsAnswer", () => {
        it("Should check user answer", () => {
            assert.isTrue(testQuestion.isAnswer(1));
            assert.isFalse(testQuestion.isAnswer(0));
        });
    });
});