/*eslint node/no-missing-require: ["off"]*/

// links the anga modules for local dev, not required
require('./links');
const anga = require('anga-core');
const entry = 'usageapp';

const mainSettings = require(`./${entry}/settings`);
// what about configs?

const { init } = anga;

init.load(mainSettings).then(() => init.start());

process.on('SIGINT', async () => {
  console.log('stopping hapi server, SIGINT');
  try {
    await init.shutdown();
  } catch (err) {
    console.error('shutdown error', err);
  }
});

process.on('SIGUSR2', async () => {
  console.log('stopping hapi server, SIGUSR2');
  try {
    await init.shutdown();
  } catch (err) {
    console.error('shutdown error', err);
  }
  process.kill(process.pid, 'SIGUSR2');
});
