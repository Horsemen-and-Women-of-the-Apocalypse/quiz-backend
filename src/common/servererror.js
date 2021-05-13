/**
 * Server error class
 */
class ServerError extends Error {
    /**
     * Constructor
     *
     * @param message Message
     * @param code Error code
     */
    constructor(message, code = ServerError.DefaultErrorCode) {
        super(message);

        this.code = code;
    }

    /**
     * Set code
     *
     * @param code Code
     */
    set code(code) {
        this._code = code;
    }

    /**
     * Get code
     *
     * @return {number} Code
     */
    get code() {
        return this._code;
    }

    /**
     * Get default error code
     *
     * @return {number} Error code
     */
    static get DefaultErrorCode() {
        return 500;
    }
}

export default ServerError;
