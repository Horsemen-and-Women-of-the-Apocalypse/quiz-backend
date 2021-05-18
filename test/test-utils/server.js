import serverConfig from "../../src/config/server";

const SERVER_URL = "http://localhost:" + serverConfig.port;

// Common
const VERSION_ROUTE = "/version";

// Quiz
const QUIZ_CREATE_ROUTE = "/quiz/";
const QUIZ_LIST_ROUTE = "/quiz/list";
const QUIZ_QUESTIONS_ROUTE = (quiz) => (`/quiz/${quiz}/questions`);
const QUIZ_ANSWER_ROUTE = (quiz) => (`/quiz/${quiz}/answer`);

export { SERVER_URL, VERSION_ROUTE, QUIZ_CREATE_ROUTE, QUIZ_LIST_ROUTE, QUIZ_QUESTIONS_ROUTE, QUIZ_ANSWER_ROUTE };
