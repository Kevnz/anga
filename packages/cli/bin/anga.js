#!/usr/bin/env node

const program = require('commander');
let appName;
//auaha - create
program
  .version('1.0.0')
  .arguments('<application_name>')
  .action((application_name) => {
    appName = application_name;
  });

program.parse(process.argv);

if (typeof appName === 'undefined') {
  console.error('no command given!');
  process.exit(1);
}
console.log('command:', appName);
