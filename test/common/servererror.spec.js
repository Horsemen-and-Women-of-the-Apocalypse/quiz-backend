import { assert } from "chai";
import { describe, it } from "mocha";
import ServerError from "../../src/common/servererror";

const ERROR_MESSAGE = "ERROR_MESSAGE";
const ERROR_CODE = 10;

describe("ServerError", () => {
    it("Should be an Error", () => {
        assert.instanceOf(new ServerError(), Error);
    });

    it("Should have a property message", () => {
        assert.property(new ServerError(ERROR_MESSAGE), "message");
    });

    it("Should have a property error code", () => {
        assert.property(new ServerError(ERROR_MESSAGE), "code");
    });

    describe("#Constructor(Message)", () => {
        it("Should set message property", () => {
            assert.propertyVal(new ServerError(ERROR_MESSAGE), "message", ERROR_MESSAGE);
        });

        it("Should set error code to " + ServerError.DefaultErrorCode, () => {
            assert.propertyVal(new ServerError(ERROR_MESSAGE), "code", ServerError.DefaultErrorCode);
        });
    });

    describe("#Constructor(Message, Code)", () => {
        it("Should set error code to " + ERROR_CODE, () => {
            assert.propertyVal(new ServerError(ERROR_MESSAGE, ERROR_CODE), "code", ERROR_CODE);
        });
    });
});