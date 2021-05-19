import { HTTP } from "../../../common/apierrors";
import { Route } from "../../route";
import { Response } from "../../router";

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
    "answer": new Route(route => route + "/:id/answer", "post", answer)
};
