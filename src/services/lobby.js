import ms from "ms";
import Semaphore from "semaphore";
import applicationConfig from "../config/application";
import { Lobby } from "../models/lobby";
import { LOGGER } from "../utils";

/**
 * Service interacting with lobby objects
 */
class LobbyService {

    /**
     * Constructor
     *
     * @param lobbyDbService Lobby database service
     * @param wsService Websocket service
     */
    constructor(lobbyDbService, wsService) {
        this.lobbyDbService = lobbyDbService;
        this.wsService = wsService;

        this.scheduledTaskByLobby = new Map();
        this.scheduledTaskByLobbySemaphore = new Semaphore(1);
    }

    /**
     * Get lobby information depending on given player
     *
     * @param lobbyId Lobby id
     * @param request Player id
     * @return {Promise<{id: number, name: string, quizName: string, ownerName: string, playerNames: *[]}>} Informations
     */
    async getLobbyInfo(lobbyId, request) {
        // Check request body
        const playerId = request.playerId;
        if (!playerId) {
            throw new Error("Undefined player identifier");
        }

        // Retrieve lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);

        if (!(lobby instanceof Lobby)) {
            throw new Error("No lobby found for id: " + lobbyId);
        }

        // Check player affiliations to the lobby
        const authorized = lobby.players.find(item => item.id === playerId);
        if (!authorized) {
            throw new Error("Unauthorized player");
        }

        // Return information
        return {
            id: lobby.id,
            name: lobby.name,
            quizName: lobby.quiz.name,
            ownerName: lobby.owner.name,
            playerNames: lobby.players.map(item => {
                return item.name;
            })
        };
    }

    /**
     * Start the given lobby
     *
     * @param lobbyId Lobby's id
     * @param request Start request
     * @return {Promise<void>} Promise
     */
    async start(lobbyId, request) {
        // Check start request
        const playerId = request.playerId;
        if (typeof playerId !== "string") {
            throw new Error("Malformed player id");
        }

        // Find lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);
        if (lobby == null) {
            throw new Error("No lobby found for id: " + lobbyId);
        }

        // Check player rights
        if (lobby.owner.id !== playerId) {
            throw new Error("Insufficient rights to start a lobby");
        }

        // Update lobby's start date
        lobby.start();
        await this.lobbyDbService.updateLobbyStartDate(lobby);

        // Notify players
        await this.wsService.notifyLobbyStart(lobby.id);
        LOGGER.info("Start lobby: " + lobbyId);

        // Schedule lobby end
        this.scheduledTaskByLobbySemaphore.take(() => {
            try {
                this.scheduledTaskByLobby.set(lobbyId, setTimeout(async () => {
                    try {
                        // Update lobby's end date
                        lobby.end();
                        await this.lobbyDbService.updateLobbyEndDate(lobby);

                        // Notify end
                        await this.wsService.notifyLobbyEnd(lobbyId);
                    } catch (e) {
                        LOGGER.exception(e);
                    } finally {
                        // Remove scheduled task
                        this.scheduledTaskByLobbySemaphore.take(() => {
                            try {
                                this.scheduledTaskByLobby.delete(lobbyId);
                            } finally {
                                this.scheduledTaskByLobbySemaphore.leave();
                            }
                        });

                        LOGGER.info("End lobby: " + lobbyId);
                    }
                }, ms(applicationConfig.lobbyDuration)));
            } finally {
                this.scheduledTaskByLobbySemaphore.leave();
            }
        });
    }

    /**
     * Test whether there is no scheduled tasks
     *
     * @return {Promise<boolean>} Promise containing true
     * if there is no scheduled tasks, false otherwise
     */
    async noScheduledTasks() {
        return new Promise(((resolve, reject) => {
            try {
                this.scheduledTaskByLobbySemaphore.take(() => {
                    try {
                        resolve(this.scheduledTaskByLobby.size === 0);
                    } finally {
                        this.scheduledTaskByLobbySemaphore.leave();
                    }
                });
            } catch (e) {
                reject(e);
            }
        }));
    }
}

export default LobbyService;
