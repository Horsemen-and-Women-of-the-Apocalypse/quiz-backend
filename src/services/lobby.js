import { Lobby } from "../models/lobby";
import moment from "moment";

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
     * Get questions of a given lobby
     *
     * @param lobbyId >Lobby's id
     * @return {Promise<[{question: string, choices: []}]>} Questions without solution
     */
    async getLobbyQuestions(lobbyId) {
        // Retrieve lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);
        if (!(lobby instanceof Lobby)) {
            throw new Error("No lobby found for id: " + lobbyId);
        }

        // Format questions and remove their solution
        const questions = lobby.quiz.questions.map(item => {
            let ques = {
                "question": item._question
            };

            switch(item.constructor.name) {
                case "StringMultipleChoiceQuestion":
                    ques.choices = item._choices;
                    break;
                default:
                    throw new Error("Question type not yet implemented");
            }

            return ques;
        });

        return questions;
    }

    /**
     * Assert if the looby is ongoing
     *
     * @param lobbyId >Lobby's id
     * @return {bool} True if the player is in the lobby
     */
    async isLobbyOngoing(lobbyId) {
        // Retrieve lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);
        if (!(lobby instanceof Lobby)) {
            throw new Error("No lobby found for id: " + lobbyId);
        }

        const now = moment();

        // Check lobby's dates (inclusive on start and exclusive on end)
        if (lobby.startDate === null && lobby.endDate !== null) {
            throw new Error("Lobby is not start but has a schedule end date");
        }
        if (lobby.startDate !== null && lobby.endDate === null) {
            return now.isSameOrAfter(lobby.startDate);
        }

        return now.isBetween(lobby.startDate, lobby.endDate, undefined, "[)");

    }

    /**
     * Assert if the player is the owner or a player of the lobby
     *
     * @param lobbyId >Lobby's id
     * @param playerId >Player's id
     * @return {bool} True if the player is in the lobby
     */
    async isPlayerInLobby(lobbyId, playerId) {
        // Retrieve lobby
        const lobby = await this.lobbyDbService.findById(lobbyId);
        if (!(lobby instanceof Lobby)) {
            throw new Error("No lobby found for id: " + lobbyId);
        }

        // check if playerId is one of lobby's player
        return lobby.players.some(player => player._id === playerId);
    }

}

export default LobbyService;