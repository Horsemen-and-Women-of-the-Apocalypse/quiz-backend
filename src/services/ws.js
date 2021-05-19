import io from "socket.io";
import { AUTH } from "../common/apierrors";
import AuthError from "../common/autherror";
import LOGGER from "../utils/logger";

class WebsocketService {


    /**
     * Initialize websocket
     *
     * @param server {Server} HTTP server
     */
    init(server) {
        this.ws = io(server, { path: WebsocketService.RELATIVE_PATH });
        LOGGER.info("[WS] Websocket opened on localhost" + this.ws._path);

        // Define middleware
        this.ws.use((socket, next) => { this.middleware(socket, next) });

        // Define connection callback
        this.ws.on("connect", this.onConnection);
        this.ws.on("connection", this.onConnection);
    }

    /**
     * Define socket's middleware
     *
     * @param socket Socket
     * @param next Next function
     * @return {Promise<void>} Promise
     */
    async middleware(socket, next) {
        try {
            console.log('middelware');
            let { player, lobby } = await this.checkUserAccess(socket.handshake.query);
            console.log(player);
            console.log(lobby);
            next();


        } catch (error) {
            LOGGER.warn("[WS] Failed websocket connection : " + error.message);
            next(error);
        }
    }


    /**
     * Callback on client connection
     *
     * @param client Client
     */
    onConnection(client) {
        console.log('onConnection');

        LOGGER.info("[WS] Connection opened with " + client.handshake.address);

        client.emit("connection", "CONNECTION_OPENED");

        client.on("disconnect", () => {
            LOGGER.info("[WS] Connection closed with " + client.handshake.address);
        });
        client.on("joinLobby", (p) => {
            console.log(p);
        });
    }

    /**
     * Get relative path
     *
     * @return {string} Path
     */
    static get RELATIVE_PATH() {
        return "/ws";
    }

    /**
     * Check the user given credentials at each messages
     * @param {object} query
     */
    async checkUserAccess(query) {
        console.log('checkUserAccess');

        if (!query) throw new AuthError(AUTH.ACCESS_DENIED + " a querry is requiered");
        if (!query.playerId) throw new AuthError(AUTH.ACCESS_DENIED + " a playerId is requiered");
        if (!query.quizId) throw new AuthError(AUTH.ACCESS_DENIED + " a querryId is requiered");

        console.log('OK');
        // TODO Check Credentials with DB

        return { player: true, lobby: true }
    }
}

export default WebsocketService;
