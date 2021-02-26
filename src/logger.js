const { createLogger, format, transports } = require('winston');
const { appRoot, customConsole, customJson, customExtra } = require('./winston-formatter');

const LOG_FILEDIR = process.env.LOG_FILEDIR || `${appRoot}/logs/`;
const LOG_FILENAME = process.env.LOG_FILENAME || 'app.log';

const logger = new createLogger({
  format: format.combine(
    format.timestamp({}),
    format.errors({ stack: true })
  ),
  transports: [
    new transports.File({
      level: 'debug',
      filename: `${LOG_FILEDIR}${LOG_FILENAME}`,
      handleExceptions: true,
      maxsize: 104857600, // 100MB
      maxFiles: 1,
      format: format.combine(
        format.errors({ stack: true }),
        format.metadata({ alias: 'meta', fillExcept: ['timestamp', 'time', 'process', 'level', 'message', 'msg'] }),
        customJson(),
        customExtra(),
        format.json()
      )
    }),
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.prettyPrint(),
        customExtra(),
        customConsole
      )
    })
  ],
  exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;