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

        response.json(Response.OK);
    } catch (e) {
        next(e);
    }
};


/**
 * Callback on /lobby/:id/join
 *
 * @param services Services
 */
const join = async (services, request, response, next) => {
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

        // Try to join a lobby
        const join = await services.lobbyService.joinLobby(lobbyId, request.body);

        // Notify everyone
        services.ws.broadcastLobby(lobbyId, request.body.playerName, false);

        // Send join response
        response.json(new Response(join));
    } catch (e) {
        next(e);
    }
};

/**
 * Callback on /lobby/create
 *
 * @param services Services container
 * @param request Request
 * @param response Response
 * @param next Next function
 * @return {Promise<void>} Promise
 */
const create = async (services, request, response, next) => {
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

        // Try to join a lobby
        const join = await services.lobbyService.joinLobby(lobbyId, request.body);

        // Notify everyone
        services.ws.broadcastLobby(lobbyId, request.body.playerName, false);

        // Send join response
        response.json(new Response(join));
        // Create a lobby
        const lobby = await services.lobbyService.create(request.body);

        response.json(new Response(services.lobbyService.lobbyToJSON(lobby)));
    } catch (e) {
        next(e);
    }
};

export default {
    "info": new Route(route => route + "/:id/info", "post", info),
    "join": new Route(route => route + "/:id/join", "put", join),
    "addAnswer": new Route(route => route + "/:lobby_id/player/:player_id/answer", "post", addAnswers),
    "create": new Route(route => route + "/create", "post", create)
};