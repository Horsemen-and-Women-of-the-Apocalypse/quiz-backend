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
    });

    describe("#IsAnswer", () => {
        it("Should check user answer", () => {
            assert.isTrue(testQuestion.isAnswer(1));
            assert.isFalse(testQuestion.isAnswer(0));
        });
    });
});