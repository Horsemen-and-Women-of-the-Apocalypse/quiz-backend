/**
 * Question interface
 */
class IQuestion {
    constructor() {
        this.title;
        this.answer;
    }

    /**
     * Check the answer depending on question type
     * 
     * @param {*} input User input
     */
    checkAnswer(input) {}
}

/**
 * Multiple choice question class
 */
class StringMultipleChoiceQuestion extends IQuestion {
    constructor() {
        super();
        this.choices;
        this.solutionIndex;
    }

    checkAnswer(userChoice) {
        // XXX: If there are several user choices and solution indexes, they need to be sorted first
        return userChoice === this.solutionIndex;
    }
}