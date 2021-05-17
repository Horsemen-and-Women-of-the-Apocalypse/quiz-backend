/**
 * Player class
 */

class Player {
    /**
     * New player
     *
     * @param {string} name
     * @returns {Player}
     */
    constructor(name) {
        this._id = null; // generated at insertion
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

