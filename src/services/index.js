import WebsocketService from "./ws";
import QuizService from "./quiz/QuizService";

/**
 * Service container
 */
class ServiceContainer {
    /**
     * Constructor
     * @param ws {WebsocketService} Websocket service
     * @param quizService {QuizService} Quiz service
     */
    constructor(ws,quizService) {
        this._ws = ws;
        this._quizService = quizService;
    }

    /**
     * Get websocket service
     *
     * @return {WebsocketService} Service
     */
    get ws() {
        return this._ws;
    }

    /**
     * Get quiz service
     *
     * @return {QuizService} Service
     */
    get quizService() {
        return this._quizService;
    }
}

/**
 * Init services container
 *
 * @param {Server} server HTTP server
 * @return {Promise<ServiceContainer>} Services container
 */
const init = async (server, database) => {
    // Initialize services
    const ws = new WebsocketService();
    ws.init(server);

    // Quiz service
    const quizService = new QuizService(database);

    return new ServiceContainer(ws,quizService);
};

export default init;
