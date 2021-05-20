import ms from "ms";
import { application as config } from "./config";

/**
 * Function to assert configuration
 *
 * @param config Configuration
 */
const assert = (config) => {
    if (typeof config.lobbyDuration !== "string") {
        throw new Error("lobby_duration isn't defined");
    } else {
        try {
            ms(config.lobbyDuration);
        } catch (e) {
            throw new Error("Failed to interpret lobby_duration: '" + e.message + "'");
        }
    }
};

if (!(config instanceof Object)) {
    throw new Error("Application configuration isn't defined");
}

// Modify config
config.lobbyDuration = config.lobby_duration;

// Assert config
assert(config);

export default config;
