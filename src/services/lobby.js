import { Lobby } from "../models/lobby";
import { Player } from "../models/player";

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
     * Join an available lobby
     * 
     * @param lobbyId Lobby id
     * @param request Player name
     * @return {Promise<{playerId: number}} Newly added player id
     */
    async joinLobby(lobbyId, request) {
        // Check request body
        const playerName = request.playerName;
        if (!playerName) {
            throw new Error("Undefined player name");
        }

        // Retrieve lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);

        if (!(lobby instanceof Lobby)) {
            throw new Error("No lobby found for id: " + lobbyId);
        }

        // Check lobby status
        if (lobby.startDate) {
            if (!lobby.endDate) {
                throw new Error("Game already started");
            } else {
                throw new Error("Game ended");
            }
        }

        // Check player existence (by name)
        const usedName = lobby.players.find(item => item.name === playerName);
        if (usedName) {
            throw new Error("Name already used");
        }

        // Add player to lobby
        const player = new Player(playerName);
        lobby.addPlayer(player);
        await this.lobbyDbService.addPlayersToLobby(lobby, player);

        // Return generated player id
        return { playerId: player.id }; 
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
            playerNames: lobby.players.map(item => { return item.name; })
        };
    }

}

export default LobbyService;