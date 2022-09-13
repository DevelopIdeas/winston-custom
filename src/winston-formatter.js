const { format } = require('winston');
const httpContext = require('express-http-context');
const util = require('util');
const { appRoot, getProcessName } = require('./process-utils');

const { pid } = process;
const processName = getProcessName();

let LOG_CONSOLE_CONTEXT = parseInt(process.env.LOG_CONSOLE_CONTEXT);
LOG_CONSOLE_CONTEXT = isNaN(LOG_CONSOLE_CONTEXT) ? 0 : LOG_CONSOLE_CONTEXT;

const customExtra = format((info, opts) => {
  const context = httpContext.get('context') || null;
  const request_id = httpContext.get('request_id');
  let process = processName;
  if (info.meta && info.meta.__logger_process) {
    process = info.meta.__logger_process;
    delete info.meta.__logger_process;
  }
  const ret = { ...info, context: context, process, pid }
  if (request_id) {
    ret.request_id = request_id
  }
  return ret
});

const customJson = format((info, opts) => {
  if (info.timestamp) {
    info.time = info.timestamp;
    delete info.timestamp;
  }
  if (info.message) {
    info.msg = info.message;
    delete info.message;
  }
  if (info[Symbol.for('splat')]) {
    const meta = info[Symbol.for('splat')][0]
    if (typeof meta !== 'object') {
      info.metadata.msg = meta;
    }
  }
  info.meta = info.metadata;
  delete info.metadata;
  delete info.__logger_process;
  return info;
});

const customConsole = format.printf(({ level, message, timestamp, context, process, ...metadata }) => {
  const metaKeys = Object.keys(metadata);
  let meta = metaKeys.length > 0 ? {} :  null;
  for (let key of metaKeys) {
    meta[key] = metadata[key]
  }
  // let meta = null;
  // const splat = metadata[Symbol.for('splat')];
  // if (splat && splat.length > 0) {
  //   meta = splat[0] || null;
  // }
  if (typeof message === 'object') {
    message = util.inspect(message, false, null, true);
  }
  let __namespace = null
  if (typeof meta === 'object') {
    if (meta.__namespace) {
      __namespace = meta.__namespace
      delete meta.__namespace
    }
    meta = util.inspect(meta, false, null, true);
  }
  let contextStr = '';
  if (LOG_CONSOLE_CONTEXT === 1) {
    if (typeof context === 'object') {
      context = util.inspect(context, false, null, true);
    }
    contextStr = ` context: ${context}`;
  }
  const out = `${timestamp} ${process ? `[${process}]${__namespace ? `[${__namespace}]` : ''} ` : ''}${level}: ${message} meta: ${meta}${contextStr}`;
  return out;
})

module.exports = { appRoot, customConsole, customJson, customExtra }
