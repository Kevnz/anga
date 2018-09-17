/*eslint node/no-missing-require: ["off"]*/

// links the anga modules for local dev, not required
require('./links');
const anga = require('anga-core');
const entry = 'usageapp';

const mainSettings = require(`./${entry}/settings`);
// what about configs?

const { init, logger } = anga({ name: entry });

init.load(mainSettings).then(() => init.start());

process.on('uncaughtException', (e) => {
  logger.error('uncaught ex', e);
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  logger.error('unhandledRejection', e);
  process.exit(1);
});
process.on('SIGINT', async () => {
  logger.info('stopping hapi server, SIGINT');
  try {
    await init.shutdown();
  } catch (err) {
    logger.error('shutdown error', err);
  }
});

process.on('SIGUSR2', async () => {
  logger.info('stopping hapi server, SIGUSR2');
  try {
    await init.shutdown();
  } catch (err) {
    logger.error('shutdown error', err);
  }
  process.kill(process.pid, 'SIGUSR2');
});
