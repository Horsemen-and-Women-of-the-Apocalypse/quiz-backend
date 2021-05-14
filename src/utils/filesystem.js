import fs from "fs";
import { sep as PATH_SEPARATOR } from "path";

/**
 * Function to list all files of a directory
 *
 * @param directory Directory
 * @param files Reference to a list that will hold of files
 */
const filesInDirectoryImpl = (directory, files) => {
    // List files of current directory
    let dirFiles = fs.readdirSync(directory);

    // Dig
    dirFiles.forEach((file) => {
        let path = directory + (directory.endsWith(PATH_SEPARATOR) ? "" : PATH_SEPARATOR) + file;

        if (fs.statSync(path).isDirectory()) {
            filesInDirectoryImpl(path, files);
        } else {
            files.push({
                directory: directory,
                path: path
            });
        }
    });
};

/**
 * Function to list all files in a directory
 *
 * @param directory
 * @return {String[]} List of files
 */
const filesInDirectory = (directory) => {
    let files = [];

    filesInDirectoryImpl(directory, files);
    return files;
};

/**
 * Build a path with parts
 *
 * @param parts Parts
 * @return {String} Path
 */
const path = (...parts) => {
    return parts.join(PATH_SEPARATOR);
};

export { filesInDirectory, path };