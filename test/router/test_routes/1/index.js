import { Route } from "../../../../src/router/route";

export default {
    "base": new Route((route) => route, "get", () => {
    }),
    "base-2": new Route((route) => route + "/sub", "put", () => {
    })
};