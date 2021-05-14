import { sep as PATH_SEPARATOR } from "path";
import { filesInDirectory } from "../utils";
import LOGGER from "../utils/logger";

/**
 * Function to init routes
 *
 * @param app Application
 * @param services Services
 * @param path Path to routes
 */
const init = (app, services, path) => {
    let routes = filesInDirectory(path);
    let count = 0;

    // Load routes
    routes.forEach((route) => {
        let relativePath = route.directory.split(path.slice(process.cwd().length))[1];

        // Fix route
        if (PATH_SEPARATOR !== "/") {
            relativePath = relativePath.split(PATH_SEPARATOR).join("/");
        }
        if (relativePath.length === 0) {
            relativePath = "/";
        }

        // Load sub routes
        let subRoutes = Object.values(require(route.path).default);
        for (let i = 0; i < subRoutes.length; i++) {
            if (app[subRoutes[i].method] === undefined) {
                throw new Error("Unknown HTTP method: " + subRoutes[i].method);
            }

            app[subRoutes[i].method](subRoutes[i].route(relativePath), (request, response, next) => subRoutes[i].callback(services, request, response, next));
        }
        LOGGER.info("[Express] Load routes in " + route.path);

        // Display loaded routes
        let i;
        for (i = count; i < app._router.stack.length; i++) {
            if (app._router.stack[i].route) {
                LOGGER.info("\t[" + Object.keys(app._router.stack[i].route.methods).map(method => method.toUpperCase()).join("|") + "] " + app._router.stack[i].route.path);
            }
        }
        count = i;
    });
};

/**
 * Json response
 */
class Response {
    /**
     * Constructor
     *
     * @param data Data
     * @param error Error
     */
    constructor(data = null, error = null) {
        this.data = data;
        this.error = error;
    }

    /**
     * Get OK response
     *
     * @return {Response} Response
     */
    static get OK() {
        return new Response("OK");
    }
}

export { init, Response };
