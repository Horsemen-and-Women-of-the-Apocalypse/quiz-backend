import serverConfig from "../../src/config/server";

const SERVER_URL = "http://localhost:" + serverConfig.port;

// Common
const VERSION_ROUTE = "/version";
const QUIZ_ANSWER_ROUTE = (id) => "/quiz/" + id + "/answer";

export { SERVER_URL, VERSION_ROUTE, QUIZ_ANSWER_ROUTE };
