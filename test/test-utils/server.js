import serverConfig from "../../src/config/server";

const SERVER_URL = "http://localhost:" + serverConfig.port;

// Common
const VERSION_ROUTE = "/version";

// Quiz
const QUIZ_ANSWER_ROUTE = (id) => "/quiz/" + id + "/answer";
const QUIZ_LIST_ROUTE = "/quiz/list";

// Lobby
const LOBBY_INFORMATION_ROUTE = (id) => `/lobby/${id}/info`;

export { SERVER_URL, VERSION_ROUTE, QUIZ_LIST_ROUTE, QUIZ_ANSWER_ROUTE, LOBBY_INFORMATION_ROUTE };
