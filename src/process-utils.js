const appRoot = require('path').dirname(require.main.filename || process.mainModule.filename);

const getProcessName = () => {
  const prefix = process.env.LOG_PROCESS_PREFIX || null;
  let processName = process.env.name || null;
  if (processName && prefix) {
    processName = `${prefix}-${processName}`;
  }
  return processName;
}

module.exports = { appRoot, getProcessName }