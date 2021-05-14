import cors from "cors";
import express from "express";
import { Server } from "http";
import responseTime from "response-time";
import Semaphore from "semaphore";
import serverConfig from "./config/server";
import { init as initRoutes, Response } from "./router/router";
import initServices from "./services";
import { LOGGER, path } from "./utils";
import { DEVELOPMENT_MODE, environment } from "./utils/node";

// Create application & websocket
const app = express();
const server = Server(app);

// Activate json pretty print (in dev mode)
if (environment() === DEVELOPMENT_MODE) {
    app.set("json spaces", 4);
}

// Set up CORS
const corsConfig = { origin: true, credentials: true };
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Use JSON decoder for "application/json" body
app.use(express.json());

// Add response time
app.use(responseTime((req, res, time) => {
    LOGGER.info("[Express] " + req.method + " " + req.originalUrl + " in " + time.toFixed(3) + "ms => response code: " + res.statusCode);
}));

const startSemaphore = new Semaphore(1);
startSemaphore.take(() => {
});

// Start app
server.listen(serverConfig.port, async () => {
    LOGGER.info("[Main] App listening on port : " + serverConfig.port + " (mode: " + environment() + ")");

    try {
        // Init services here
        const services = await initServices();

        // Set-up routes
        initRoutes(app, services, path(__dirname, "router", "routes"));

        // Set up error handler
        app.use((error, req, res, next) => {
            LOGGER.exception(error);

            // Send response
            res.status(error.code ? error.code : 500).json(new Response("KO", error.message));

            next();
        });

        startSemaphore.leave();
        LOGGER.info("[Main] Server is ready");
    } catch (e) {
        LOGGER.exception(e);
        process.exit(1);
    }
});

export { server, startSemaphore };
