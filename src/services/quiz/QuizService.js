import { Quiz } from "../../models/quiz";
import { StringMultipleChoiceQuestion } from "../../models/question";

class QuizService {
    /**
     * Constructor
     * 
     * @param database Object, ref to Mongo database
     */
    constructor(database) {
        this.database = database;
    }

    /**
     * Retrieve all quizzes
     * 
     * @return {Array<Quiz>}
     *  */ 
    async allQuizzes() {
        let quizzes = await this.database.getAllDocumentsFromCollection(QuizService.getCollection());
        return quizzes.map(q => new Quiz(q._name, q._questions.map(ques => new StringMultipleChoiceQuestion(ques._question, ques._choices, ques._solutionIndex))));
    }

    /**
     * Return the correct quiz
     * 
     * @param ObjectId Int, integer which point on the chosen quiz, Required
     * @return {Quiz}, or null if there is no occurence
     *  */ 
    async findById(ObjectId) {
        let q = (await this.database.db.collection(QuizService.getCollection()).findOne({ "_id":ObjectId }));
        if(!(q === null)) {
            return new Quiz(q._name, q._questions.map(ques => new StringMultipleChoiceQuestion(ques._question, ques._choices, ques._solutionIndex)));
        } else {
            return null;
        }
    }

    /**
     * Return the DB collection of quizzes
     * 
     * @return Quiz
     *  */ 
    static getCollection() {
        return "quizzes";
    }

    /**
     * Drop the DB collection of quizzes
     * 
     *  */
    async dropCollection () {
        await this.database.dropCollection(QuizService.getCollection());
    }

}

export default QuizService;