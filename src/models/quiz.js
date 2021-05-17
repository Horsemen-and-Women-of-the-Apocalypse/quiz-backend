import { Question } from "./question";

/**
 * Quiz class
 */
class Quiz {
    constructor(name, questions) {
        if(typeof name !== "string") {
            throw new Error("Expected a string for parameter 'name'");
        }

        if(Array.isArray(questions)) {
            for(let i = 0; i < questions.length; i ++) {
                if(!(questions[i] instanceof Question)) {
                    throw new Error("Unexpected type in 'questions' array");
                }
            }
        } else {
            throw new Error("Expected an array for parameter 'questions'");
        }

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

