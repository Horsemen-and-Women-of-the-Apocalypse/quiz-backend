/**
 * Quiz class
 */
class Quiz {
    constructor(name, questions) {
        this._name = name;
        this._questions = questions;
    }

    /**
     * Get identifier
     */
    get id() {
        return this._id;
    }

    /**
     * Set identifier
     */
    set id(id) {
        this._id = id;
    }

    /**
     * Get name
     */
    get name() {
        return this._name;
    }

    /**
     * Get questions
     */
    get questions() {
        return this._questions;
    }
}

export { Quiz };

