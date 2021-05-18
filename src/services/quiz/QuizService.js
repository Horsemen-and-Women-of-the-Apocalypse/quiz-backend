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
     * @return {Promise<Array<object>}
     *  */ 
    async allQuizzes() {
        let quizzes = await this.database.getAllDocumentsFromCollection(QuizService.getCollection());
        return quizzes.map(q => new Quiz(q._name, q._questions.map(ques => new StringMultipleChoiceQuestion(ques._question, ques._choices, ques._solutionIndex))));
    }

    /**
     * Return the correct quiz
     * 
     * @param ObjectId Int, integer which point on the chosen quiz, Required
     *  */ 
    // find avec id connu / inconnu
    async findById(ObjectId) {
        return (await this.database.db.collection(QuizService.getCollection()).findOne({ "_id":ObjectId }));
    }

    static getCollection() {
        return "quizzes";
    }

    async dropCollection () {
        return await this.database.dropCollection(QuizService.getCollection());
    }

}

export default QuizService;
