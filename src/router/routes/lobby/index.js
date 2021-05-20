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

export default {
    "info": new Route(route => route + "/:id/info", "post", info)
};