import { Lobby } from "../models/lobby";

/**
 * Service interacting with lobby objects
 */
class LobbyService {

    /**
     * Constructor
     *
     * @param lobbyDbService Lobby database service
     */
    constructor(lobbyDbService) {
        this.lobbyDbService = lobbyDbService;
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

        // Return informations
        return {
            id: lobby.id,
            name: lobby.name,
            quizName: lobby.quiz.name,
            ownerName: lobby.owner.name,
            playerNames: lobby.players.map(item => { return item.name; })
        };
    }

}

export default LobbyService;