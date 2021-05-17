import fs from "fs";
import ini from "ini";
import { LOGGER } from "../utils";
import { environment } from "../utils/node";

// Load config
const configPath = "./config/app." + environment() + ".ini";
const config = ini.parse(fs.readFileSync(configPath, "UTF-8"));

LOGGER.info("[Config] Load configuration from: " + configPath);

// Split config
const server = config.server;
const database = config.database;

export { server, database };
