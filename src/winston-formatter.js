const { format } = require('winston');
const httpContext = require('express-http-context');
const util = require('util');
const { appRoot, getProcessName } = require('./process-utils');

const { pid } = process;
const processName = getProcessName();

const customExtra = format((info, opts) => {
  const context = httpContext.get('context') || null;
  const request_id = httpContext.get('request_id');
  return { ...info, context: context, process: processName, request_id: request_id ? request_id : undefined, pid }
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
  return info;
});

const customConsole = format.printf(({ level, message, timestamp, context, process, ...metadata }) => {
  const splat = metadata[Symbol.for('splat')];
  let meta = null;
  if (splat && splat.length > 0) {
    meta = splat[0];
  }
  if (typeof message === 'object') {
    // message = JSON.stringify(message);
    message = util.inspect(message, false, null, true);
  }
  if (typeof meta === 'object') {
    // meta = JSON.stringify(meta);
    meta = util.inspect(meta, false, null, true);
  }
  if (typeof context === 'object') {
    // context = JSON.stringify(context);
    context = util.inspect(context, false, null, true);
  }
  const out = `${timestamp} ${process ? `[${process}] ` : ''}${level}: ${message} meta: ${meta} context: ${context}`;
  return out;
})

module.exports = { appRoot, customConsole, customJson, customExtra }