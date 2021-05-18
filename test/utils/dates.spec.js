import { assert } from "chai";
import { describe, it } from "mocha";
import { generateCurrentDate, convertMomentToTimestamp, convertTimestampToMoment } from "../../src/utils/dates";
import moment from "moment";

describe("Dates utilities", () => {
    describe("#date generation", () => {
        it("Should generate a moment date", () => {
            assert.equal(typeof generateCurrentDate(), typeof moment());
        });
    });

    describe("#date convertion", () => {
        it("Should generate a timestamp from a moment obj", () => {
            let date = generateCurrentDate();
            let ts = convertMomentToTimestamp(date);
            assert.isTrue(typeof ts === "number");

            let newDate = convertTimestampToMoment(ts);
            assert.isTrue(moment.isMoment(newDate));

            assert.equal(convertMomentToTimestamp(date), convertMomentToTimestamp(newDate));
        });
        it("Should check for types and all", () => {
            assert.throws(() => {
                convertMomentToTimestamp("not a moment obj");
            }, Error, "Unexpected type for the date");
            assert.throws(() => {
                convertTimestampToMoment("not a timestamp");
            }, Error, "Expected a timestamp for the strDate");
        });
    });
});