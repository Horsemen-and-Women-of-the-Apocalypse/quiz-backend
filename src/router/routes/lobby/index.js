import { HTTP } from "../../../common/apierrors";
import { Route } from "../../route";
import { Response } from "../../router";

/**
 * Callback on /lobby/:id/info
 *
 * @param services Services
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const info = async (services, request, response, next) => {
    try {
        // Check lobby id
        const lobbyId = request.param("id");
        if (typeof lobbyId !== "string") {
            throw new Error("Lobby id is undefined");
        }

        // Check body
        if (!(request.body instanceof Object)) {
            throw new Error(HTTP.BODY_UNDEFINED);
        }

        // Retrieve lobby information from service
        const info = await services.lobbyService.getLobbyInfo(lobbyId, request.body);

        // Send lobby information
        response.json(new Response(info));
    } catch (e) {
        next(e);
    }
};

/**
 * Callback on post /lobby/:lobby_id/player/:player_id/answer
 *
 * @param services Services
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const addAnswers = async (services, request, response, next) => {
    try {
        // Check lobby id
        const lobbyId = request.param("lobby_id");
        if (typeof lobbyId !== "string") throw new Error("Lobby id is undefined");

        // Check player id
        const playerId = request.param("player_id");
        if (typeof playerId !== "string") throw new Error("player id is undefined");

        // Check body
        if (!(request.body instanceof Object)) throw new Error(HTTP.BODY_UNDEFINED);
        if (!("answers" in request.body)) throw new Error("the 'answers' array is required in the payload");

        await services.lobbyService.addAnswers(lobbyId, playerId, request.body.answers);

        response.ok();
    } catch (e) {
        next(e);
    }
};

export default {
    "info": new Route(route => route + "/:id/info", "get", info),
    "addAnswer": new Route(route => route + "/:lobby_id/player/:player_id/answer", "post", addAnswers)
};