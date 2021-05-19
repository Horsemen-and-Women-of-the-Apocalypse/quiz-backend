import WebsocketService from "./ws";
import QuizService from "./lobby/QuizService";
import LobbyDbService from "./db/lobbyDbService";

/**
 * Service container
 */
class ServiceContainer {
    /**
     * Constructor
     * @param ws {WebsocketService} Websocket service
     * @param quizService {QuizService} Quiz service
     */
    constructor(ws,quizService, lobbyDbService) {
        this._ws = ws;
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
 * @return {Promise<ServiceContainer>} Services container
 */
const init = async (server, database) => {
    // Initialize services
    const ws = new WebsocketService();
    ws.init(server);

    // Quiz service
    const quizService = new QuizService(database);
    // Lobby service
    const lobbyDbService = new LobbyDbService(database, quizService);

    return new ServiceContainer(ws,quizService, lobbyDbService);
};

export default init;
