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
 * Callback on /lobby/:id/questions
 * 
 * @param services Services 
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const questions = async (services, request, response, next) => {
    try {
        // Check lobby's id
        const lobbyId = request.param("id");
        if (typeof lobbyId !== "string") {
            throw new Error("Lobby's id is undefined");
        }

        // Check body of request
        if (!(request.body instanceof Object)) {
            throw new Error(HTTP.BODY_UNDEFINED);
        }

        // Check player's id exist
        if (!(typeof request.body.playerId === "string")) {
            throw new Error("Player's id is undefinined");
        }

        // Check player's id is in the lobby 
        if( !(await services.lobbyService.isPlayerInLobby(lobbyId,request.body.playerId)) ) {
            throw new Error("Player's id is not in the lobby");
        }

        // Check date Range 
        if ( !(await services.lobbyService.isLobbyOngoing(lobbyId))) {
            throw new Error("Lobby's dates are not logical");
        }

        // Get all questions from lobby's quiz
        const questions = await services.lobbyService.getLobbyQuestions(lobbyId);

        // Send questions
        response.json(new Response(questions));
    } catch(e) {
        next(e);
    }
};

export default {
    "info": new Route(route => route + "/:id/info", "get", info),
    "questions": new Route(route => route + "/:id/questions", "get", questions)
};