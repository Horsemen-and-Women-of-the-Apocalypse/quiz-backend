import { ObjectID } from "mongodb";
import { StringMultipleChoiceQuestion } from "../../models/question";
import { Quiz } from "../../models/quiz";

/**
 * Convert to quiz in MongoDB format into a Quiz object
 *
 * @param obj Quiz from MongoDB
 * @return {null|Quiz} Quiz or null if obj is undefined
 */
const toModelObject = (obj) => {
    if (!(obj instanceof Object)) {
        return null;
    }

    const quiz = new Quiz(obj._name, obj._questions.map(ques => new StringMultipleChoiceQuestion(ques._question, ques._choices, ques._solutionIndex)));
    quiz.id = obj._id.toString();
    return quiz;
};

class QuizDatabaseService {
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
     * @return Array<Quiz>
     *  */
    async allQuizzes() {
        let quizzes = await this.database.getAllDocumentsFromCollection(QuizDatabaseService.getCollection());
        return quizzes.map(toModelObject);
    }

    /**
     * Return the correct quiz
     *
     * @param ObjectId Int, integer which point on the chosen quiz, Required
     * @return Quiz
     *  */
    async findById(ObjectId) {
        return toModelObject(await this.database.db.collection(QuizDatabaseService.getCollection()).findOne({ _id: new ObjectID(ObjectId) }));
    }

    /**
     * Add quiz in DB quizzes collection and add its id
     *
     * @param {Quiz} quiz, ..., Required
     * @return {string} Quiz._id
     *  */
    async addQuiz(quiz) {
        if (!(quiz instanceof Quiz)) throw new Error("Unexpected type for the quiz");

        let quizJSON = {
            _name: quiz._name,
            _questions: quiz._questions.map(ques => {
                return {
                    _question: ques._question,
                    _choices: ques._choices,
                    _solutionIndex: ques._solutionIndex
                };
            })
        };

        quiz.id = await this.database.addDocument(quizJSON, QuizDatabaseService.getCollection());
        return quiz.id;
    }

    /**
     * Return the DB collection of quiz
     *
     * @return Quiz
     *  */
    static getCollection() {
        return "quizzes";
    }

    /**
     * Drop the DB collection of quiz
     *
     *  */
    async dropCollection() {
        await this.database.dropCollection(QuizDatabaseService.getCollection());
    }
}

export default QuizDatabaseService;
