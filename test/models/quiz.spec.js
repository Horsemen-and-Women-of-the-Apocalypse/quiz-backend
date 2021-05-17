import { assert } from "chai";
import { describe, it } from "mocha";
import { Quiz } from "../../src/models/quiz";
import { StringMultipleChoiceQuestion } from "../../src/models/question";

describe("Quiz", () => {
    describe("#Constructor", () => {
        const obj1 = {
            question: "What is love ?",
            choices: [ "Never gonna let you down", "Baby don't hurt me", "Hey, now, you're a rock star, get the show on, get paid" ],
            solutionIndex: 1
        };

        const obj2 = {
            question: "Which band is the best ?",
            choices: [ "BTS", "One Direction", "Metallica", "Russian Boys Band" ],
            solutionIndex: 3
        };

        const obj3 = {
            question: "Which instrument looks like a musical note ?",
            choices: [ "Piano", "Ukulele", "Otamatone", "Response D" ],
            solutionIndex: 2
        };

        const q1 = new StringMultipleChoiceQuestion(obj1.question, obj1.choices, obj1.solutionIndex);
        const q2 = new StringMultipleChoiceQuestion(obj2.question, obj2.choices, obj2.solutionIndex);
        const q3 = new StringMultipleChoiceQuestion(obj3.question, obj3.choices, obj3.solutionIndex);

        const quizObj = {
            name: "Some random quiz",
            questions: [ q1, q2, q3 ]
        };

        const testQuiz = new Quiz(quizObj.name, quizObj.questions);

        it("Should be initialized properly", () => {
            assert.sameMembers(testQuiz.questions, quizObj.questions);
            assert.equal(testQuiz.name, quizObj.name);
        });
    });
});