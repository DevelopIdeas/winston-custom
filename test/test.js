const { createLogger, appRoot } = require('../src/logger');
const path = require('path');
const logger = createLogger();
const logger1 = createLogger({ process: 'hello' });
const logger2 = createLogger({ process: 'hello2', filePath: path.join(appRoot, './logs/status.log') });

logger.info('hello 1')
logger1.info('hello 2')
logger2.info('hello 3')