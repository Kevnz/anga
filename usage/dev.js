const nodemon = require('nodemon');
const db = require('./dev-server');
db().then(() => {
  console.log('In Memory DB has started');

  nodemon({
    script: 'index.js',
    ext: 'js json html',
    watch: ['./', '../packages']
  });

  nodemon
    .on('start', () => {
      console.log('App has started');
    })
    .on('quit', () => {
      console.log('App has quit');
      process.exit();
    })
    .on('restart', (files) => {
      console.log('App restarted due to: ', files);
    });
});
