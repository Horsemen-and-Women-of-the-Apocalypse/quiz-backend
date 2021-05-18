import chai from "chai";
import { after, afterEach, before, beforeEach, describe, it } from "mocha";
import { database } from "../../src/config/database";
import { HTTP } from "../../src/common/errors";
import { QuizService } from "../../src/services/quiz";
import { initAndReset, reset } from "../test-utils/database";
import { parseJSONResponse } from "../test-utils/http";
import { SERVER_URL, QUIZ_CREATE_ROUTE, QUIZ_LIST_ROUTE, QUIZ_QUESTIONS_ROUTE, QUIZ_ANSWER_ROUTE } from "../test-utils/server";
import { create as createQuizDBService } from "../../src/services/db/quiz";

// Add HTTP
chai.use(require("chai-http"));

const QUIZ_ID = 1;
const QUIZ_NAME = "Some random quiz again";
const QUIZ_QUESTIONS = [
    {
        "name": "Who is that Pokemon ?",
        "solutionIndex": 0,
        "choices": [
            "Clefairy",
            "Pikachu",
            "Snorlax"
        ]
    },
    {
        "name": "Question 2",
        "solutionIndex": 3,
        "choices": [
            "Response A",
            "Response B",
            "Response C",
            "Response D"
        ]
    },
    {
        "name": "True or False ? AI will replace us.",
        "solutionIndex": 3,
        "choices": [
            "True",
            "Of course it's fake loool",
        ]
    }
];

let quiz_service;

describe("#QuizAPI", () => {
    before(done => {
        initAndReset()
            .then(() => done())
            .catch(done);
    });

    beforeEach(done => {
        createQuizDBService()
            .then(s => {
                quiz_service = s;
                
                return chai.request(SERVER_URL)
                    .post(QUIZ_CREATE_ROUTE)
                    .send({
                        name: QUIZ_NAME,
                        questions: QUIZ_QUESTIONS
                    });
            })
            .then(response => {
                chai.assert.equal(response.status, 200);

                done();
            })
            .catch(done);
    });

    after(() => {
        // Close database
        database.close();
    });

    afterEach(done => {
        reset().then(() => done()).catch(done);
    });

    describe("create", () => {
        it("Should create a quiz", async () => {
            const request = { 
                name: "Test quiz",
                questions: [
                    {
                        "name": "Am I a question ?",
                        "solutionIndex": 1,
                        "choices": [
                            "Yes",
                            "No",
                        ]
                    },
                    {
                        "name": "Question 2",
                        "solutionIndex": 3,
                        "choices": [
                            "Response A",
                            "Response B",
                            "Response C",
                            "Response D"
                        ]
                    }
                ]
            };

            let response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send(request);
            
            chai.assert.equal(response.status, 200);
            
            const quiz = await quiz_service.getById(2);
            chai.assert.equal(quiz.name, request.name);
            chai.assert.sameMembers(quiz.questions, request.questions);
        });

        it("Empty body, should throw an error", async () => {
            let response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send({});
            
            chai.assert.notEqual(response.status, 200);
            chai.assert.equal(parseJSONResponse(response).error, HTTP.BODY_UNDEFINED);
        });

        it("Wrong question format, should throw an error", async () => {
            const wrongRequest = {
                "name": "Not cool quiz",
                "questions": [
                    {
                        "question": "Not that cool question ?",
                        "solutionIndex": 0,
                        "answers": [
                            "That's crap"
                        ]
                    }
                ]
            };

            let response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send(wrongRequest);
            
            chai.assert.notEqual(response.status, 200);
        });

        it("Wrong name property type, should throw an error", async () => {
            const wrongRequest = {
                "name": 1337,
                "questions": [
                    {
                        "question": "Am I a question ?",
                        "solutionIndex": 0,
                        "answers": [
                            "Yes",
                            "No"
                        ]
                    }
                ]
            };

            let response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send(wrongRequest);
            
            chai.assert.notEqual(response.status, 200);
        });

        it("Wrong solution index, should throw an error", async () => {
            const wrongRequest = {
                "name": "Some wrong quiz again and again",
                "questions": [
                    {
                        "question": "Am I a question ?",
                        "solutionIndex": 8,
                        "answers": [
                            "Yes",
                            "No"
                        ]
                    }
                ]
            };

            let response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send(wrongRequest);
            
            chai.assert.notEqual(response.status, 200);
        });
    });

    describe("list", () => {
        it("Should return all quizzes", async () => {
            let response = await chai.request(SERVER_URL).get(QUIZ_LIST_ROUTE);
            
            chai.assert.equal(response.status, 200);
            chai.assert.sameDeepMembers(parseJSONResponse(response).data, (await quiz_service.all()).map(QuizService.ToAPIObject));
        });
    });

    describe("questions", () => {
        it("Should return all questions of a given quiz", async () => {
            let response = await chai.request(SERVER_URL).get(QUIZ_QUESTIONS_ROUTE(QUIZ_ID));

            chai.assert.equal(response.status, 200);
            const quiz = await quiz_service.getById(QUIZ_ID); 
            chai.assert.sameDeepMembers(parseJSONResponse(response).data, quiz.questions);
        });

        it("Nonexistent quiz, should throw an error", async () => {
            let response = await chai.request(SERVER_URL).get(QUIZ_QUESTIONS_ROUTE(69));

            chai.assert.notEqual(response.status, 200);
        });
    });

    describe("answer", () => {
        it("Should return user answer check", async () => {
            const answers = {
                "answers": [
                    1,
                    2,
                    3
                ]
            };

            let response = await chai.request(SERVER_URL).get(QUIZ_ANSWER_ROUTE(QUIZ_ID)).send(answers);
                
            chai.assert.equal(response.status, 200);

            const expectedResults = {
                "score": 1,
                "maxScore": QUIZ_QUESTIONS.length(),
                "fails": [
                    {
                        "userAnswer": 1,
                        "solution": QUIZ_QUESTIONS[0].answers.choices[QUIZ_QUESTIONS[0].solutionIndex]
                    },
                    {
                        "userAnswer": 2,
                        "solution": QUIZ_QUESTIONS[1].answers.choices[QUIZ_QUESTIONS[1].solutionIndex]
                    }
                ]
            };

            chai.assert.equal(parseJSONResponse(response).data.score, expectedResults.score);
            chai.assert.equal(parseJSONResponse(response).data.maxScore, expectedResults.maxScore);
            chai.assert.sameDeepOrderedMembers(parseJSONResponse(response).data.fails, expectedResults.fails);
        });

        it("Nonexistent quiz, should throw an error", async () => {
            const answers = {
                "answers": [
                    1,
                    2,
                    3
                ]
            };

            let response = await chai.request(SERVER_URL).get(QUIZ_ANSWER_ROUTE(69)).send(answers);

            chai.assert.notEqual(response.status, 200);
        });

        it("Wrong id format, should throw an error", async () => {
            const answers = { "answers": [ 1, 2, 3 ] };

            let response = await chai.request(SERVER_URL).get(QUIZ_ANSWER_ROUTE("FENOUIL")).send(answers);

            chai.assert.notEqual(response.status, 200);
        });

        it("Invalid body, should throw an error", async () => {
            const charAnswers = { "answers": [ "a", "b", "c" ] };
            let response = await chai.request(SERVER_URL).get(QUIZ_ANSWER_ROUTE(1)).send(charAnswers);
            chai.assert.notEqual(response.status, 200);

            const wrongSizeAnswers = {
                "answers": [
                    1,
                    2
                ]
            };
            response = await chai.request(SERVER_URL).get(QUIZ_ANSWER_ROUTE(1)).send(wrongSizeAnswers);
            chai.assert.notEqual(response.status, 200);
        });
    });
});