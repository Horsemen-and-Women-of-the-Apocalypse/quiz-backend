/**
 * Multiple choice question class
 */
class StringMultipleChoiceQuestion {
    constructor(question, choices, solutionIndex) {
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

export { StringMultipleChoiceQuestion };