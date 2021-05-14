import WebsocketService from "./ws";

/**
 * Service container
 */
class ServiceContainer {
    /**
     * Constructor
     * @param ws {WebsocketService} Websocket service
     */
    constructor(ws) {
        this._ws = ws;
    }

    /**
     * Get websocket service
     *
     * @return {WebsocketService} Service
     */
    get ws() {
        return this._ws;
    }
}

/**
 * Init services container
 *
 * @param {Server} server HTTP server
 * @return {Promise<ServiceContainer>} Services container
 */
const init = async (server) => {
    // Initialize services
    const ws = new WebsocketService();
    ws.init(server);

    return new ServiceContainer(ws);
};

export default init;
