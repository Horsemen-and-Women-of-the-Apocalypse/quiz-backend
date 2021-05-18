import moment from "moment";

/**
 * Generate a moment date at the current date
 * @returns {moment}
 */
function generateCurrentDate() {
    return moment();
}

/**
 * Convert a moment date to a database string format
 * @param {moment} momentDate the moment date to convert
 * @returns {number} timestamp date at the unix timestamp format
 */
function convertMomentToTimestamp(momentDate) {
    if (!(momentDate instanceof moment.Moment)) throw new Error("Unexpected type for the date");
    return momentDate.unix();
}

/**
 * Convert a unix format date to a moment date to store in objects
 * @param {number} strDate timestamp date at the unix timestamp format  to convert
 * @returns {moment} at the unix timestamp format
 */
function convertTimestampToMoment(timestamp) {
    if (typeof timestamp !== "number") throw new Error("Expected a string for the strDate");

    return moment.unix(timestamp);
}

export { generateCurrentDate, convertMomentToTimestamp, convertTimestampToMoment };
