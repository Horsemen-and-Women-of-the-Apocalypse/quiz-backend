import { assert } from "chai";
import { describe, test } from "mocha";
import { database } from "../../../src";
import { createQuiz } from "../../common/utils";
import { StringMultipleChoiceQuestion } from "../../../src/models/question";
import { Quiz } from "../../../src/models/quiz";
import QuizService from "../../../src/services/db/quiz";

// A besoin que la collection des quiz soit déjà créée dans la BDD
describe("QuizService", () => {

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

    const quizObj = new Quiz("Some random quiz", [ q1, q2, q3 ]);
    const quizObj2 = new Quiz("Some random quiz 2", [ q1, q2, q3 ]);

    test("Should add a quiz to DataBase", async () => {
        let quizService = new QuizService(database);

        // Reset DataBase
        await quizService.dropCollection();

        await quizService.addQuiz(quizObj);
        let quizzes = await quizService.allQuizzes();

        delete quizObj._id;
        delete quizzes[0]._id;
        assert.deepEqual(quizzes[0], quizObj);
    });

    test("Should find a quiz in DataBase which matches the id", async () => {
        let quizService = new QuizService(database);

        // Reset DataBase
        await quizService.dropCollection();

        delete quizObj._id;
        delete quizObj2._id;
        await database.addDocument(quizObj, QuizService.getCollection());
        await database.addDocument(quizObj2, QuizService.getCollection());

        let quiz = await quizService.findById(quizObj2._id);

        delete quiz._id;
        delete quizObj2._id;
        assert.deepEqual(quiz, quizObj2);
    });

    test("Should not find any quizzes in DataBase which matches the id", async () => {
        let quizService = new QuizService(database);

        // Reset DataBase
        await quizService.dropCollection();

        let quiz = await quizService.findById();

        assert.deepEqual(quiz, null);
    });

    test("Should add quiz in DataBase and return its id", async () => {
        let quizService = new QuizService(database);
        let quiz = createQuiz();

        // Reset DataBase
        await quizService.dropCollection();

        // Add quiz in DB
        let returnId = await quizService.addQuiz(quiz);

        let quizFound = await quizService.findById(returnId);
        delete quiz._id;

        assert.deepEqual(quiz, quizFound);
    });
});
