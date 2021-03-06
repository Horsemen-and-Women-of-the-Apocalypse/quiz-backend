import { v4 as uuidv4 } from "uuid";

/**
 * Player class
 */
class Player {
    /**
     * New player
     *
     * @param {string} name
     * @param {string} id autogenerated if null
     * @returns {Player}
     */
    constructor(name, id=null) {
        this._id = (id === null ? uuidv4(): id);
        this.name = name;

        if (typeof name !== "string") throw new Error("Expected a string for parameter 'name'");
        if (!name.length) throw new Error("The player name should not be empty");
    }

    /**
     * Get identifier
     */
    get id() { return this._id; }

    /**
     * Set identifier
     */
    set id(id) { this._id = id; }
}

export { Player };

