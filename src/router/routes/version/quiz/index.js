import { Route } from "../../../route";
import { QuizService } from "../../../../services/quiz";
import { HTTP } from "../../../../common/errors";
import { ServerError } from "../../../../common/servererror";
import { Response } from "../../../router";

/**
 * Function that defines a callback on /
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next 
 */
const create = async (services, request, response, next) => {
    try {
        if (!(request.body instanceof Object)) {
            throw new ServerError(HTTP.BODY_UNDEFINED);
        }

        // Create quiz
        await services.quiz.create(request.body);
        response.json(Response.OK); 
    } catch(e) {
        next(e);
    }
};

/**
 * Function that defines a callback on /:id/questions
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next 
 */
const questions = async (services, request, response, next) => {
    try {
        response.json(new Response((await services.quiz.questions()).map(QuizService.ToAPIObject)));
    } catch (e) {
        next(e);
    }
};

/**
 * Function that defines a callback on /:id/answer
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next
 */
const answer = async (services, request, response, next) => {
    try {
        if (!(request.body instanceof Object)) {
            throw new ServerError(HTTP.BODY_UNDEFINED);
        }

        // XXX: Not sure
        response.json(new Response((await services.quiz.answer(request.body)).map(QuizService.ToAPIObject))); 
    } catch (e) {
        next(e);
    } 
};

/**
 * Function that defines a callback on /list
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next
 */
const list = async (services, request, response, next) => {
    try {
        response.json(new Response((await services.quiz.all()).map(QuizService.ToAPIObject)));
    } catch(e) {
        next(e);
    } 
};

export default {
    "quiz-creation": new Route(route => route, "create", create),
    "quiz-list": new Route(route => route + "/list", "get", list),
    "quiz-questions": new Route(route => route + "/:id/questions", "get", questions),
    "quiz-answer": new Route(route => route + "/:id/answer", "post", answer),
};