import fs from "fs";
import { Route } from "../../route";
import { Response } from "../../router";

const project = JSON.parse(fs.readFileSync("./package.json", "UTF-8"));

/**
 * Function that defines a callback for base route
 *
 * @param services Services
 * @param request Request
 * @param response Response
 */
const baseRoute = (services, request, response) => {
    response.json(new Response({
        version: project.version
    }));
};

export default {
    "base": new Route(route => route, "get", baseRoute)
};
