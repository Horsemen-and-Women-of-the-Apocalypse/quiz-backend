import { assert } from "chai";

/**
 * Function to parse a JSON response
 *
 * @param response HTTP response
 * @return {Object} Object
 */
const parseJSONResponse = (response) => {
    assert.equal(response.type, "application/json", response.text + " must be a JSON");

    return JSON.parse(response.text);
};

export { parseJSONResponse };