import { assert } from "chai";
import { describe, test } from "mocha";
import { StringMultipleChoiceQuestion } from "../../../src/models/question";
import QuizService from "../../../src/services/quiz/QuizService";
import { database } from "../../../src";

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

    const quizObj = {
        _name: "Some random quiz",
        _questions: [ q1, q2, q3 ]
    };

    const quizObj2 = {
        _name: "Some random quiz 2",
        _questions: [ q1, q2, q3 ]
    };

    test("Should add a quiz to DataBase", async () => {

        let quizService = new QuizService(database);

        // Reset DataBase
        await quizService.dropCollection();
        await quizService.createCollection();

        await database.addDocument( quizObj , QuizService.getCollection() );
        let quizzes = await quizService.allQuizzes();

        delete quizObj._id;

        assert.deepEqual(quizzes[0], quizObj);
    });
    test("Should find a quiz in DataBase which matches the id", async () => {
        let quizService = new QuizService(database);

        // Reset DataBase
        await quizService.dropCollection();
        await quizService.createCollection();

        await database.addDocument( quizObj , QuizService.getCollection() );
        await database.addDocument( quizObj2 , QuizService.getCollection() );
        
        let quiz = await quizService.findById(quizObj2._id);

        assert.deepEqual(quiz, quizObj2);
    });
    test("Sould not find any quizzes in DataBase which matches the id", async () => {
        let quizService = new QuizService(database);

        // Reset DataBase
        await quizService.dropCollection();
        await quizService.createCollection();

        await database.addDocument( quizObj , QuizService.getCollection() );
        let id2 = await database.addDocument( quizObj2 , QuizService.getCollection() );
        
        let quiz = await quizService.findById(id2 + 54621852);

        assert.deepEqual(quiz, null);
    });
});