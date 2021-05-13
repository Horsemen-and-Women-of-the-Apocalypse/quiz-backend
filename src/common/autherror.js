import ServerError from "./servererror";

/**
 * Authentication error
 */
class AuthError extends ServerError {
    /**
     * Constructor
     *
     * @param message Message
     */
    constructor(message) {
        super(message, 403);
    }
}

export default AuthError;
