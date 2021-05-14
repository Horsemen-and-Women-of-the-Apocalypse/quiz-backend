import { assert } from "chai";
import { describe, it } from "mocha";
import { sep as PATH_SEPARATOR } from "path";
import { filesInDirectory, path } from "../../src/utils";

const TEST_DIRECTORY = path("./test", "utils", "test_dir");

const toFile = (filepath) => {
    let parts = filepath.split(PATH_SEPARATOR);

    return {
        directory: path(TEST_DIRECTORY, filepath.split(PATH_SEPARATOR).slice(0, parts.length - 1).join(PATH_SEPARATOR)),
        path: path(TEST_DIRECTORY, filepath)
    };
};

describe("FileSystem utilities", () => {
    describe("#filesInDirectory()", () => {
        it("Should throw an exception", () => {
            assert.throws(() => filesInDirectory(undefined));
            assert.throws(() => filesInDirectory(null));
            assert.throws(() => filesInDirectory("unknown_directory"));
        });

        it("Should have the expected files", () => {
            let files = filesInDirectory(path(TEST_DIRECTORY));

            assert.lengthOf(files, 4);
            assert.includeDeepMembers([ toFile(path("1", "2", "test.txt")), toFile(path("1", "test-2.md")), toFile(path("3", "test-2.cpp")), toFile(path("3", "test.yml")) ], files);

            files = filesInDirectory(path(TEST_DIRECTORY, "1", "2"));

            assert.lengthOf(files, 1);
            assert.includeDeepMembers([ toFile(path("1", "2", "test.txt")) ], files);
        });
    });

    describe("#path()", () => {
        it("Should concatenate strings", () => {
            let p = path("test", "sub", "1");

            assert.lengthOf(p.split(PATH_SEPARATOR), 3);
        });
    });
});