import winston from "winston";
import WinstonDailyRotateFile from "winston-daily-rotate-file";
import { environment } from "../utils/node";

const TIME_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";
const PRINT_FUNC = info => `${info.level}: [${info.timestamp}] ${info.message}`;

const dev_config = {
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: TIME_FORMAT }),
        winston.format.simple(),
        winston.format.printf(PRINT_FUNC)
    ),
    transports: [
        new winston.transports.Console()
    ]
};

const ci_config = {
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: TIME_FORMAT }),
        winston.format.simple(),
        winston.format.printf(PRINT_FUNC)
    ),
    transports: [
        new winston.transports.Console()
    ]
};

const prod_config = {
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: TIME_FORMAT }),
        winston.format.simple(),
        winston.format.printf(PRINT_FUNC)
    ),
    transports: [
        new winston.transports.Console(),
        new WinstonDailyRotateFile({
            filename: "./log/repowee-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            maxSize: "20m",
            maxFiles: "30d"
        })
    ]
};

// Choose configuration depending on environment
let configuration;
switch (environment()) {
    case "production":
        configuration = prod_config;
        break;

    case "ci":
        configuration = ci_config;
        break;

    default:
        configuration = dev_config;
}

export default configuration;