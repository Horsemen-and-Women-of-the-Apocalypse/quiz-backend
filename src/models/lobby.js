import { Player } from "./player";
import { Quiz } from "./quiz";
import { generateCurrentDate } from "../utils/dates";

/**
 * Lobby class
 */
class Lobby {
    /**
     * New quiz
     *
     * @param {string} name
     * @param {Quiz} quiz The quiz the players will play on
     * @param {Player} owner Player owner of the game, only him can start the game
     * @param {Array<Player>} players Player of the game, the owner shouldn't be included
     * @param {Moment} startDate null by default, date of the start of the game if started
     * @param {Moment} endDate null by default, date of the end of the game if endend
     * @returns {Lobby}
     */
    constructor(name, quiz, owner, players, startDate=null, endDate=null) {
        if (typeof name !== "string") throw new Error("Expected a string for parameter 'name'");
        if (!name.length) throw new Error("The lobby name should not be empty");

        if (!(quiz instanceof Quiz)) throw new Error("Unexpected type for the quiz");

        if (!(owner instanceof Player)) throw new Error("Unexpected type for the owner");

        if (!Array.isArray(players)) throw new Error("Expected an array for parameter 'players'");
        for (let i = 0; i < players.length; i++) {
            if (!(players[i] instanceof Player)) throw new Error("Unexpected type in 'players' array");
            if (players[i] === owner) throw new Error("The owner should not be included in the players");
        }

        this._id = null; // generated at insertion
        this.name = name;
        this.quiz = quiz;
        this.startDate = startDate; // Moment object, to prevent early answers
        this.endDate = endDate;     // Moment object, to prevent late answers
        this.owner = owner;
        this._otherPlayers = players;
        this.answersByPlayerId = [];
    }

    /**
     * Get identifier
     */
    get id() { return this._id; }
    /**
     * Get all the lobby players
     * @returns {Array<Player>} the inserted players and the owner in one array
     */
    get players() { return [ this.owner, ...this._otherPlayers ]; }

    /**
     * Set identifier
     */
    set id(id) { this._id = id; }

    /**
     * Start the lobby
     */
    start() {
        if (this.startDate !== null) throw new Error("The lobby has already started");

        this.startDate = generateCurrentDate();
    }

    /**
     * End the lobby
     */
    end() {
        if (this.endDate !== null) throw new Error("The lobby has already ended");

        this.endDate = generateCurrentDate();
    }
}


export { Lobby };

