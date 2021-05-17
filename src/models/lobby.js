/**
 * Lobby class
 */

import moment from "moment";
import { Player } from "./player";
import { Quiz } from "./quiz";

class Lobby {
    /**
     * New quiz
     *
     * @param {string} name
     * @param {Quiz} quiz The quiz the players will play on
     * @param {Player} owner Player owner of the game, only him can start the game
     * @param {Array<Player>} players Player of the game, the owner shouldn't be included
     * @returns {Lobby}
     */
    constructor(name, quiz, owner, players) {

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
        this.startDate = null; // start date, to prevent early answers
        this.endDate = null; // end date, to prevent late answers
        this.owner = owner;
        this._otherPlayers = players;
        this.answersByPlayerId = [];
    }

    /**
     * Get identifier
     */
    get id() { return this._id; }
    get players() { return [ this.owner, ...this._otherPlayers ]; }

    /**
     * Set identifier
     */
    set id(id) { this._id = id; }

    /**
     * Start the lobby
     */
    start() {
        this.startDate = moment().format("MMMM Do YYYY, h:mm:ss a");
    }

    /**
     * End the lobby
     */
    end() {
        this.endDate = moment().format("MMMM Do YYYY, h:mm:ss a");
    }
}


export { Lobby };

