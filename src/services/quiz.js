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
     * Check user's answers for the given quiz
     *
     * @param quizId Quiz's id
     * @param request User's answers request
     * @return {Promise<{score: number, maxScore, fails: *[]}>} Results
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
        let score = 0;
        const maxScore = quiz.questions.length;
        const fails = [];
        let i = 0;
        for (; i < quiz.questions.length && request.answers.length; i++) {
            if (quiz.questions[i].isAnswer(request.answers[i])) {
                score++;
            } else {
                fails.push({
                    userAnswer: request.answers[i],
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
