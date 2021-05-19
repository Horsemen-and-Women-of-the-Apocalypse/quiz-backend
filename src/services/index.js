import WebsocketService from "./ws";
import QuizService from "./quiz/QuizService";
import LobbyService from "./lobby/lobbyService";

/**
 * Service container
 */
class ServiceContainer {
    /**
     * Constructor
     * @param ws {WebsocketService} Websocket service
     * @param quizService {QuizService} Quiz service
     */
    constructor(ws,quizService, lobbyService) {
        this._ws = ws;
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
     * Get quiz service
     *
     * @return {QuizService} Service
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
 * @return {Promise<ServiceContainer>} Services container
 */
const init = async (server, database) => {
    // Initialize services
    const ws = new WebsocketService();
    ws.init(server);

    // Quiz service
    const quizService = new QuizService(database);
    quizService.init();

    // Lobby service
    const lobbyService = new LobbyService(database, quizService);

    return new ServiceContainer(ws,quizService, lobbyService);
};

export default init;
