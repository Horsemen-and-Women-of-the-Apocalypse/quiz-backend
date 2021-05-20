import { StringMultipleChoiceQuestion } from "../models/question";
import { Quiz } from "../models/quiz";

/**
 * Service interacting with quiz objects
 */
class QuizService {

    /**
     * Constructor
     *
     * @param quizDbService Quiz database service
     */
    constructor(quizDbService) {
        this.quizDbService = quizDbService;
    }

    /**
     * Return all quizzes saved in the database
     *
     * @return {Promise<[{id: number, name: string}]>} Array of quizzes
     */
    async getAllQuizzes() {
        return (await this.quizDbService.allQuizzes()).map((item) => {
            return {
                "id": item._id,
                "name": item._name
            };
        });
    }

    /**
     * Create a quiz based on a creation request
     *
     * @param request Creation request
     * @return {Promise<string>} Promise containing quiz's id
     */
    async create(request) {
        // Check request
        if (!Array.isArray(request.questions)) {
            throw new Error("Malformed questions");
        }

        // Save quiz
        return this.quizDbService.addQuiz(new Quiz(request.name, request.questions.map(q => new StringMultipleChoiceQuestion(q.question, q.choices, q.solutionIndex))));
    }

    /**
     * Get questions of a given quiz
     *
     * @param quizId Quiz's id
     * @return {Promise<[{question: string, choices: []}]>} Questions without solution
     */
    async getQuizQuestions(quizId) {
        // Retrieve quiz
        const quiz = await this.quizDbService.findById(quizId);
        if (!(quiz instanceof Quiz)) {
            throw new Error("No quiz found for id: " + quizId);
        }

        // Format questions and remove solution for each of them
        const questions = quiz.questions.map(item => {
            let q = {
                "question": item._question
            };

            switch(item.constructor.name) {
                case "StringMultipleChoiceQuestion":
                    q.choices = item._choices;
                    break;
                default:
                    throw new Error("Question type not yet implemented");
            }

            return q;
        });

        return questions;
    }

    /**
     * Check user's answers for the given quiz
     *
     * @param quizId Quiz's id
     * @param request User's answers request
     * @return {Promise<{score: number, maxScore, fails: *[]}>} Promise containing results
     */
    async checkResults(quizId, request) {
        // Check answers
        if (!Array.isArray(request.answers)) {
            throw new Error("Malformed answers");
        }

        // Retrieve quiz
        const quiz = await this.quizDbService.findById(quizId);
        if (!(quiz instanceof Quiz)) {
            throw new Error("No quiz found for id: " + quizId);
        }

        // Check results
        return this.getResultsFromAnswers(quiz, request.answers);
    }
    /**
     * Check user's answers for the given quiz
     *
     * @param {Quiz} quiz
     * @param {Player} player
     * @return {score: number, maxScore, fails: *[]} Object containing results
     */
    getResultsFromAnswers(quiz, answers) {
        // Check results
        let score = 0;
        const maxScore = quiz.questions.length;
        const fails = [];
        let i = 0;
        for (; i < quiz.questions.length && answers.length; i++) {
            if (quiz.questions[i].isAnswer(answers[i])) {
                score++;
            } else {
                fails.push({
                    userAnswer: answers[i],
                    solution: quiz.questions[i].solution
                });
            }
        }
        for (; i < quiz.questions.length; i++) {
            fails.push({
                userAnswer: null,
                solution: quiz.questions[i].solution
            });
        }

        return {
            score: score,
            maxScore: maxScore,
            fails: fails
        };
    }
}

export default QuizService;
