import serverConfig from "../../src/config/server";

const SERVER_URL = "http://localhost:" + serverConfig.port;

// Common
const VERSION_ROUTE = "/version";

// Quiz
const QUIZ_ANSWER_ROUTE = (id) => `/quiz/${id}/answer`;
const QUIZ_QUESTIONS_ROUTE = (id) => `/quiz/${id}/questions`;
const QUIZ_LIST_ROUTE = "/quiz/list";
const QUIZ_CREATE_ROUTE = "/quiz/create";

// Lobby
const LOBBY_INFORMATION_ROUTE = (id) => `/lobby/${id}/info`;
const LOBBY_CREATE_ROUTE = "/lobby/create";

export { SERVER_URL, VERSION_ROUTE, QUIZ_QUESTIONS_ROUTE, QUIZ_LIST_ROUTE, QUIZ_CREATE_ROUTE, QUIZ_ANSWER_ROUTE, LOBBY_INFORMATION_ROUTE, LOBBY_CREATE_ROUTE };
