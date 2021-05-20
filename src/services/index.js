import QuizDatabaseService from "./db/quiz";
import QuizService from "./quiz";
import WebsocketService from "./ws";
import LobbyDbService from "./db/lobbyDbService";


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
    constructor(ws, quizDbService, quizService, lobbyDbService) {
        this._ws = ws;
        this._quizDbService = quizDbService;
        this._quizService = quizService;
        this._lobbyDbService = lobbyDbService;
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
     * @return {LobbyDbService} Service
     */
    get lobbyDbService() {
        return this._lobbyDbService;
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

    const quizdbService = new QuizDatabaseService(database);
    const quizService = new QuizService(quizdbService);
    const lobbyDbService = new LobbyDbService(database, quizdbService);

    const ws = new WebsocketService(lobbyDbService);
    ws.init(server);

    return new ServiceContainer(ws, quizdbService, quizService, lobbyDbService);
};

export default init;
