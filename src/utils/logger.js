import winston from "winston";
import configuration from "../config/logger";

const LOGGER = winston.createLogger(configuration);

/**
 * Method to log an error
 *
 * @param error Error
 */
LOGGER.exception = (error) => {
    LOGGER.error(error.stack);
};

export default LOGGER;