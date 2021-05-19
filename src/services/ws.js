import io from "socket.io";
import { AUTH } from "../common/apierrors";
import AuthError from "../common/autherror";
import LOGGER from "../utils/logger";

class WebsocketService {
    /**
     *
     * @param {LobbyDbService} lobbyDbService
     */
    constructor(lobbyDbService) {
        this.lobbyDbService = lobbyDbService;
    }

    /**
     * Initialize websocket
     *
     * @param server {Server} HTTP server
     */
    init(server) {
        this.ws = io(server, { path: WebsocketService.RELATIVE_PATH });
        LOGGER.info("[WS] Websocket opened on localhost" + this.ws._path);

        // Define middleware
        this.ws.use((socket, next) => { this.middleware(socket, next); });

        // Define connection callback
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
            let { player, lobby } = await this.checkUserAccess(socket.handshake.query);
            socket.data = {};
            socket.data.player = player;
            socket.data.lobby = lobby;
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
        LOGGER.info("[WS] Connection opened with " + client.handshake.address);

        client.emit("connection", "CONNECTION_OPENED, connected to the lobby");

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

    /**
     * Check the user given credentials at each messages
     * @param {object} query
     */
    async checkUserAccess(query) {
        if (!query || !query.playerId) throw new AuthError(AUTH.ACCESS_DENIED + " a playerId is requiered");
        if (!query.lobbyId) throw new AuthError(AUTH.ACCESS_DENIED + " a lobbyId is requiered");

        // Check Credentials with DB
        const lobby = await this.lobbyDbService.findById(query.lobbyId);
        if (!lobby) throw new AuthError(AUTH.ACCESS_DENIED + " Lobby not found");

        const player = lobby.players.find(p => p.id === query.playerId);
        if (!player) throw new AuthError(AUTH.ACCESS_DENIED + " Player is not in the lobby");

        return { player: player, lobby: lobby };
    }
}

export default WebsocketService;
