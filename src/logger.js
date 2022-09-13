const { createLogger: createLoggerOrig, format, transports } = require('winston');
const httpContext = require('express-http-context');
const { v4 } = require('uuid');
const { appRoot, customConsole, customJson, customExtra } = require('./winston-formatter');
const LOG_FILEDIR = process.env.LOG_FILEDIR || `${appRoot}/logs/`;
const LOG_FILENAME = process.env.LOG_FILENAME || 'app.log';

const httpContextMiddleware = (logger) => (req, res, next) => {
  const context = {
    req_id: v4()
  };
  if (req.originalUrl) {
    context.req_path = req.originalUrl;
  }
  let host = req.headers && req.headers.host ? req.headers.host : null;
  let user_id = res.locals && res.locals.user ? res.locals.user.user_id : null;
  let email = res.locals && res.locals.user ? res.locals.user.email : null;
  if (host) {
    context.req_host = host;
  }
  if (user_id) {
    context.user_id = user_id;
  }
  if (email) {
    context.email = email;
  }
  logger.setContext(context);
  next();
}

const setContext = (updates) => {
  let context = httpContext.get('context');
  context = context ? context : {};
  updates = updates ? updates : {};
  context = { ...context, ...updates };
  httpContext.set('context', context);
}

const createLogger = (opts) => {
  let { defaultMeta, process, filePath, consoleLevel, fileLevel } = opts||{};
  defaultMeta = defaultMeta || {};
  if (process) {
    defaultMeta.__logger_process = process;
  }
  let transportArr = [];
  if (consoleLevel !== false) {
    transportArr.push(new transports.Console({
      level: consoleLevel || 'debug',
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.prettyPrint(),
        customExtra(),
        customConsole
      )
    }));
  }
  if (fileLevel !== false) {
    transportArr.push(new transports.File({
      level: fileLevel || 'debug',
      filename: filePath || `${LOG_FILEDIR}${LOG_FILENAME}`,
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
    }));
  }
  const logger = new createLoggerOrig({
    format: format.combine(
      format.timestamp({}),
      format.errors({ stack: true })
    ),
    defaultMeta,
    transports: transportArr,
    exitOnError: false, // do not exit on handled exceptions
  });
  logger.setContext = setContext;
  logger.getNamespace = (ns, extras) => {
    return logger.child({ __namespace: ns, ...(extras||{}) })
  }
  return logger;
};

module.exports = { createLogger, setContext, httpContextMiddleware, appRoot };
