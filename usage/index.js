const path = require('path');

require('app-module-path').addPath(path.join(__dirname, '../packages'));
const anga = require('core');
const entry = 'usageapp';

const mainSettings = require(`./${entry}/settings`);
// what about configs?

const { init } = anga;

init.load(mainSettings).then(() => init.start());

process.on('SIGINT', async () => {
  console.log('stopping hapi server');
  try {
    await init.shutdown();
  } catch (err) {
    console.error('shutdown error', err);
  }
});

process.on('SIGUSR2', async () => {
  console.log('stopping hapi server');
  try {
    await init.shutdown();
  } catch (err) {
    console.error('shutdown error', err);
  }
  process.kill(process.pid, 'SIGUSR2');
});
