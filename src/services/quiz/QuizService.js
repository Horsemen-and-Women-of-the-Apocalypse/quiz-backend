import { Quiz } from "../../models/quiz";
import { StringMultipleChoiceQuestion } from "../../models/question";

const fs = require("fs");

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
     * Init quizzes collection if not created yet
     * 
     *  */
    async init() {
        // parse JSON string to JSON object
        let initQuizzes = JSON.parse(fs.readFileSync("./src/data/quizzes.json", "UTF-8"));
        
        // Create Quiz object from JSON object
        let allQuizzes = initQuizzes.map(quiz => new Quiz(quiz.name, quiz.questions.map(ques => new StringMultipleChoiceQuestion(ques.question, ques.choices, ques.solutionIndex))));

        // Add default quiz in database if quizzes' collection is empty or not created
        if(this.database.isEmptyCollection(QuizService.getCollection())){
            allQuizzes.forEach(quiz => {
                this.addQuiz(quiz);
            });       
            console.log(await this.allQuizzes());
        }
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
     * Add quiz in DB quizzes collection and add its id
     * 
     * @param {Quiz} quiz, ..., Required
     * @return {string} Quiz._id
     *  */ 
    async addQuiz(quiz) {
        if (!(quiz instanceof Quiz)) throw new Error("Unexpected type for the quiz");
        let quizJSON = { 
            _name : quiz._name, 
            _questions : quiz._questions.map( ques => { 
                return { 
                    _question : ques._question, 
                    _choices : ques._choices, 
                    _solutionIndex : ques._solutionIndex 
                };
            } )
        };
        quiz.id = await this.database.addDocument(quizJSON, QuizService.getCollection());
        return quiz.id;
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
