/**
 * Multiple choice question class
 */
class Question {

}

class StringMultipleChoiceQuestion extends Question {
    constructor(question, choices, solutionIndex) {
        super();
        if(typeof question !== "string") {
            throw new Error("Expected a string for parameter 'question'");
        }

        if(Array.isArray(choices)) {
            if(choices.length < 2) {
                throw new Error("'choices' must contain at least 2 elements");
            } else {
                for (let i = 0; i < choices.length; i ++) {
                    if (typeof choices[i] !== "string") {
                        throw new Error("'Choices' must contain strings");
                    }
                }
            }
        } else {
            throw new Error("Expected an array for parameter 'choices'");
        }

        if (typeof solutionIndex === "number") {
            if (Number.isInteger(solutionIndex)) {
                if(solutionIndex < 0 || solutionIndex > choices.length) {
                    throw new Error("Wrong value of 'solutionIndex'");
                }
            } else {
                throw new Error("Expected an integer for parameter 'solutionIndex'");
            }
        } else {
            throw new Error("Expected an integer for parameter 'solutionIndex'");
        }

        this._question = question;
        this._choices = choices;
        this._solutionIndex = solutionIndex;
    }

    /**
     * Check the answer
     * 
     * @param {int} answer User answer index 
     * @returns 
     */
    isAnswer(answer) {
        // XXX: If there are several user choices and solution indexes, they need to be sorted first
        return answer === this._solutionIndex;
    }

    /**
     * Get question
     */
    get question() {
        return this._question;
    }

    /**
     * Get choices
     */
    get choices() {
        return this._choices;
    }

    /**
     * Get solution index
     */
    get solutionIndex() {
        return this._solutionIndex;
    }
}

export { Question };
export { StringMultipleChoiceQuestion };