/**
 * Server route class
 */
class Route {

    /**
     * Constructor
     *
     * @param route Function that build a route with base route in parameter
     * @param method HTTP method
     * @param callback Function callback
     */
    constructor(route, method, callback) {
        this.route = route;
        this.method = method;
        this.callback = callback;
    }

    /**
     * Set route
     *
     * @param route Route
     */
    set route(route) {
        this._route = route;
    }

    /**
     * Get route
     *
     * @return {function} Route
     */
    get route() {
        return this._route;
    }

    /**
     * Set method
     *
     * @param method Method
     */
    set method(method) {
        this._method = method;
    }

    /**
     * Get method
     *
     * @return {string} Method
     */
    get method() {
        return this._method;
    }

    /**
     * Set callback
     *
     * @param callback Callback
     */
    set callback(callback) {
        this._callback = callback;
    }

    /**
     * Get callback
     *
     * @return {function} Callback
     */
    get callback() {
        return this._callback;
    }
}

export { Route };
