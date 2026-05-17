import pino from "pino";
import pinoHttp from "pino-http";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      singleLine: false,
      translateTime: "SYS:standard",
    },
  },
});

export const httpLogger = pinoHttp({
  logger,
});
