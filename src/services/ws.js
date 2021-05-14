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
        this.ws.use(this.middleware);

        // Define connection callback
        this.ws.on("connect", this.onConnection);
    }

    /**
     * Define socket's middleware
     *
     * @param socket Socket
     * @param next Next function
     * @return {Promise<void>} Promise
     */
    async middleware(socket, next) {
        // Reject packet
        next(new AuthError(AUTH.ACCESS_DENIED));
    }

    /**
     * Callback on client connection
     *
     * @param client Client
     */
    onConnection(client) {
        LOGGER.info("[WS] Connection opened with " + client.handshake.address);

        client.emit("connection", "CONNECTION_OPENED");

        client.on("disconnect", () => {
            LOGGER.info("[WS] Connection closed with " + client.handshake.address);
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
}

export default WebsocketService;
