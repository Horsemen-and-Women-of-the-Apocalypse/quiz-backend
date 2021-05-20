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
    constructor(lobbyDbService, quizDbService) {
        this.lobbyDbService = lobbyDbService;
        this.quizDbService = quizDbService;
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

    /**
     * Insert player answer to lobby
     *
     * @param {string} lobbyId
     * @param {string} playerId
     * @param {array} answers
     */
    async addAnswers(lobbyId, playerId, answers) {
        // Retrieve lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);
        if (!(lobby instanceof Lobby)) throw new Error("No lobby found for id: " + lobbyId);

        // Retrieve lobby player
        const player = lobby.players.find(p => p.id === playerId);
        if (!(player instanceof Player)) throw new Error("No player with id: " + playerId + " found in the lobby");

        // update the lobby
        lobby.setPlayerAnswers(player, answers);

        // update the database
        await this.lobbyDbService.updateLobbyPlayerAnswers(lobby, player, answers);
    }

    /**
     * Create a lobby based on a creation request
     *
     * @param request Creation request
     * @return {Promise<Lobby>} Promise containing lobby's id
     */
    async create(request) {
        if(!(request instanceof Object)) throw new Error("Unexpected request type");

        //Find quiz
        const quiz = await this.quizDbService.findById(request.quizId);
        if (quiz === null) throw new Error("Quiz not found");

        //Lobby insertion
        const newLobby = new Lobby(request.name, quiz, new Player(request.ownerName), []);
        await this.lobbyDbService.addLobby(newLobby);
        return newLobby;
    }

    /**
     * Translate lobby to JSON equivalent
     *
     * @param lobby Lobby
     * @return {Object} Json equivalent
     */
    lobbyToJSON(lobby) {
        if(!(lobby instanceof Lobby)) throw new Error("Unexpected lobby type");

        return {
            id: lobby.id,
            name: lobby.name,
            owner: {
                id: lobby.owner.id,
                name: lobby.owner.name
            },
            quiz: {
                id: lobby.quiz.id,
                name: lobby.quiz.name
            }
        };
    }
}

export default LobbyService;