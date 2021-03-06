import chai from "chai";
import { beforeEach, describe, it } from "mocha";
import { ObjectID } from "mongodb";
import { database } from "../../../src";
import { StringMultipleChoiceQuestion } from "../../../src/models/question";
import { Quiz } from "../../../src/models/quiz";
import QuizDatabaseService from "../../../src/services/db/quiz";
import { parseJSONResponse } from "../../test-utils/http";
import { QUIZ_ANSWER_ROUTE, QUIZ_CREATE_ROUTE, QUIZ_QUESTIONS_ROUTE, QUIZ_LIST_ROUTE, SERVER_URL } from "../../test-utils/server";

const quiz = new Quiz("Test", [
    new StringMultipleChoiceQuestion("A", [ "A", "B", "C" ], 0),
    new StringMultipleChoiceQuestion("B", [ "A", "B", "C" ], 1),
    new StringMultipleChoiceQuestion("C", [ "A", "B", "C" ], 2)
]);

describe("API", () => {
    let service;
    let quizId;

    beforeEach(async () => {
        service = new QuizDatabaseService(database);

        // Reset quiz collection and add a quiz
        await service.dropCollection();
        quizId = await service.addQuiz(quiz);
    });

    describe("/quiz/list", () => {
        it("Should return all quizzes", async () => {
            const service = new QuizDatabaseService(database);

            const response = await chai.request(SERVER_URL).get(QUIZ_LIST_ROUTE);

            chai.assert.equal(response.status, 200);
            chai.assert.sameDeepMembers(parseJSONResponse(response).data, (await service.allQuizzes()).map((item) => {
                return { "id": item["_id"], "name": item["_name"] };
            }));
        });
    });

    describe("/quiz/create", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed payload", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send({ data: "DATA" });

            chai.assert.equal(response.status, 500);
        });

        it("Create a quiz", async () => {
            const quizCreationPayload = {
                name: "My testing quiz",
                questions: [
                    {
                        question: "First question",
                        choices: [ "A", "B", "C" ],
                        solutionIndex: 0
                    },
                    {
                        question: "Second question",
                        choices: [ "A", "B", "C" ],
                        solutionIndex: 2
                    }
                ]
            };

            // Create a quiz
            const response = await chai.request(SERVER_URL).post(QUIZ_CREATE_ROUTE).send(quizCreationPayload);

            // Check response
            chai.assert.equal(response.status, 200);
            const json = parseJSONResponse(response).data;
            chai.assert.typeOf(json, "string");

            // Find quiz in database
            const quiz = await service.findById(json);
            chai.assert.isNotNull(quiz);

            delete quiz._id;
            chai.assert.deepEqual(quiz,
                new Quiz(quizCreationPayload.name, quizCreationPayload.questions.map(q => new StringMultipleChoiceQuestion(q.question, q.choices, q.solutionIndex))));
        });
    });

    describe("/quiz/:id/questions", () => {
        it("Return an error because unknown quiz", async () => {
            const response = await chai.request(SERVER_URL).get(QUIZ_QUESTIONS_ROUTE(new ObjectID().toString()));

            chai.assert.equal(response.status, 500);
        });

        it("Return all questions", async () => {
            const response = await chai.request(SERVER_URL).get(QUIZ_QUESTIONS_ROUTE(quizId));
            const expectedQuestions = quiz.questions.map(item => {
                return {
                    "question": item.question,
                    "choices": item.choices
                };
            });

            chai.assert.equal(response.status, 200);
            chai.assert.sameDeepMembers(parseJSONResponse(response).data, expectedQuestions);
        });
    });

    describe("/quiz/:id/answer", () => {
        it("Send undefined payload", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_ANSWER_ROUTE(quizId)).send();

            chai.assert.equal(response.status, 500);
        });

        it("Send malformed answers", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_ANSWER_ROUTE(quizId)).send({ answers: "TODO" });

            chai.assert.equal(response.status, 500);
        });

        it("Answer an unknown quiz", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_ANSWER_ROUTE(new ObjectID().toString())).send({ answers: [] });

            chai.assert.equal(response.status, 500);
        });

        it("Answer a quiz with good answers", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_ANSWER_ROUTE(quizId)).send({ answers: quiz.questions.map(q => q.solution) });

            chai.assert.equal(response.status, 200);
            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.maxScore, quiz.questions.length);
            chai.assert.equal(json.score, json.maxScore);
            chai.assert.isEmpty(json.fails);
        });

        it("Answer a quiz with bad answers", async () => {
            const answers = [ "A", "C", "A" ];
            const response = await chai.request(SERVER_URL).post(QUIZ_ANSWER_ROUTE(quizId)).send({ answers: answers });

            chai.assert.equal(response.status, 200);
            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.maxScore, quiz.questions.length);
            chai.assert.equal(json.score, 1);
            chai.assert.sameDeepMembers(json.fails, answers.slice(1).map((answer, i) => {
                return { userAnswer: answer, solution: quiz.questions[i + 1].solution };
            }));
        });

        it("Answer nothing", async () => {
            const response = await chai.request(SERVER_URL).post(QUIZ_ANSWER_ROUTE(quizId)).send({ answers: [] });

            chai.assert.equal(response.status, 200);
            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.maxScore, quiz.questions.length);
            chai.assert.equal(json.score, 0);
            chai.assert.sameDeepMembers(json.fails, quiz.questions.map(q => {
                return { userAnswer: null, solution: q.solution };
            }));
        });

        it("Answer a quiz with good answers and more", async () => {
            const response = await chai.request(SERVER_URL)
                .post(QUIZ_ANSWER_ROUTE(quizId))
                .send({ answers: quiz.questions.map(q => q.solution).concat([ "A", "B", "C", "D" ]) });

            chai.assert.equal(response.status, 200);
            const json = parseJSONResponse(response).data;
            chai.assert.equal(json.maxScore, quiz.questions.length);
            chai.assert.equal(json.score, json.maxScore);
            chai.assert.isEmpty(json.fails);
        });
    });
});
