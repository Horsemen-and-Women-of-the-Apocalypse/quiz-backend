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
        this.ws.on("connection", (client) => { this.onConnection(client); });
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
            const { lobby, player } = await this.checkUserAccess(socket.handshake.query);
            socket.data = { lobby, player };
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

        // Add the player to the lobby ws room
        client.join(client.data.lobby.id);
        this.ws.to(client.data.lobby.id).emit("newPlayer", client.data.player.name);
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
        if (!query || !query.playerId) throw new AuthError(AUTH.ACCESS_DENIED + " a playerId is required");
        if (!query.lobbyId) throw new AuthError(AUTH.ACCESS_DENIED + " a lobbyId is required");

        // Check Credentials with DB
        const lobby = await this.lobbyDbService.findById(query.lobbyId);
        if (!lobby) throw new AuthError(AUTH.ACCESS_DENIED + " Lobby not found");

        const player = lobby.players.find(p => p.id === query.playerId);
        if (!player) throw new AuthError(AUTH.ACCESS_DENIED + " Player is not in the lobby");

        return { lobby, player };
    }

    /**
     * Send a player join notifications to everyone
     *
     * @param lobbyId Room id
     * @param playerName Message to notify
     */
    notifyPlayerJoin(lobbyId, playerName) {
        if (typeof playerName !== "string") {
            throw new Error("Message is not a string");
        }

        this.ws.to(lobbyId).emit("playerHasJoined", playerName);
    }
}

export default WebsocketService;
