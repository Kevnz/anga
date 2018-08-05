const anga = require('anga-core');
const entry = 'usageapp';

const mainSettings = require(`./${entry}/settings`);
// what about configs?

const {
  init
} = anga;

init.load(mainSettings.INSTALLED_APPS).then(() => init.start());

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