import { server as config } from "./config";

/**
 * Function to assert configuration
 *
 * @param config Configuration
 */
const assert = (config) => {
    if (isNaN(config.port)) {
        throw new Error("port isn't defined");
    }
};

if (!(config instanceof Object)) {
    throw new Error("Server configuration isn't defined");
}

// Modify config
config.port = parseInt(config.port);

// Assert config
assert(config);

export default config;
