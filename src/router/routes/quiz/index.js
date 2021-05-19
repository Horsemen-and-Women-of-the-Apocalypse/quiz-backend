import { HTTP } from "../../../common/apierrors";
import { Route } from "../../route";
import { Response } from "../../router";

/**
 * Callback on /quiz/:id/questions
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const questions = async (services, request, response, next) => {
    try {
        // Check quiz's id
        const quizId = request.param("id");
        if (typeof quizId !== "string") {
            throw new Error("Quiz's id is undefined");
        } 

        // Get all questions
        const questions = await services.quizService.getQuizQuestions(quizId);
        
        // Send questions
        response.json(new Response(questions));
    } catch(e) {
        next(e);
    }
};

/**
 * Callback on /quiz/list
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const list = async (services, request, response, next) => {
    try {
        // Get all quizzes
        const results = await services.quizService.getAllQuizzes();

        // Send results
        response.json(new Response(results));
    } catch(e) {
        next(e);
    } 
};

/**
 * Callback on /quiz/:id/answer
 *
 * @param services Service container
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const answer = async (services, request, response, next) => {
    try {
        // Check quiz's id
        const quizId = request.param("id");
        if (typeof quizId !== "string") {
            throw new Error("Quiz's id is undefined");
        }

        // Check body
        if (!(request.body instanceof Object)) {
            throw new Error(HTTP.BODY_UNDEFINED);
        }

        // Check results
        const results = await services.quizService.checkResults(quizId, request.body);

        // Send results
        response.json(new Response(results));
    } catch (e) {
        next(e);
    }
};

export default {
    "list": new Route(route => route + "/list", "get", list),
    "question": new Route(route => route + "/:id/questions", "get", questions),
    "answer": new Route(route => route + "/:id/answer", "post", answer)
};