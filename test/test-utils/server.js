import serverConfig from "../../src/config/server";

const SERVER_URL = "http://localhost:" + serverConfig.port;

// Common
const VERSION_ROUTE = "/version";

export { SERVER_URL, VERSION_ROUTE };
