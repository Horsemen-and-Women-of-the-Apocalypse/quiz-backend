/**
 * Function to check if application is in production mode
 *
 * @return {boolean} Mode is set to production
 */
const isProduction = () => {
    return environment() === "production";
};

/**
 * Function to get value of process.env.NODE_ENV
 */
const environment = () => {
    return process.env.NODE_ENV;
};

const DEVELOPMENT_MODE = "development";

export { isProduction, environment, DEVELOPMENT_MODE };
