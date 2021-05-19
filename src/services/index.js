import QuizDatabaseService from "./db/quiz";
import QuizService from "./quiz";
import WebsocketService from "./ws";
import LobbyService from "./lobby/lobbyService";

/**
 * Service container
 */
class ServiceContainer {
    /**
     * Constructor
     * @param ws {WebsocketService} Websocket service
     * @param quizDbService {QuizDatabaseService} Quiz database service
     * @param quizService {QuizService} Quiz service
     */
    constructor(ws, quizDbService, quizService, lobbyService) {
        this._ws = ws;
        this._quizDbService = quizDbService;
        this._quizService = quizService;
        this._lobbyService = lobbyService;
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
     * Get quiz database service
     *
     * @return {QuizDatabaseService} Quiz database service
     */
    get quizDbService() {
        return this._quizDbService;
    }

    /**
     * Get quiz service
     *
     * @return {QuizService} Quiz service
     */
    get quizService() {
        return this._quizService;
    }

    /**
     * Get quiz service
     *
     * @return {LobbyService} Service
     */
    get lobbyService() {
        return this._lobbyService;
    }
}

/**
 * Init services container
 *
 * @param {Server} server HTTP server
 * @param database Database service
 * @return {Promise<ServiceContainer>} Services container
 */
const init = async (server, database) => {
    // Initialize services
    const ws = new WebsocketService();
    ws.init(server);

    // Quiz service
    const quizdbService = new QuizDatabaseService(database);
    const quizService = new QuizService(quizdbService);
    const lobbyService = new LobbyService(database, quizdbService);

    return new ServiceContainer(ws, quizdbService, quizService, lobbyService);
};

export default init;
