import { LOGGER } from "../utils";
import { database as config } from "./config";

/**
 * Function to assert configuration
 *
 * @param config Configuration
 */
const assert = (config) => {
    if (typeof config.name !== "string") {
        LOGGER.warn("Main database isn't defined");
    }

    if (!(config.auth instanceof Object) || typeof config.auth.user !== "string") {
        throw new Error("Database user isn't defined");
    }
    if (!(config.auth instanceof Object) || typeof config.auth.password !== "string") {
        throw new Error("Database user's password isn't defined");
    }
};

if (!(config instanceof Object)) {
    throw new Error("Database configuration isn't defined");
}

// Assert config
assert(config);

export { config };
