/*eslint node/no-unpublished-require: ["off"]*/
const fuxor = require('fuxor');
const core = require('../packages/core');
const admin = require('../packages/admin');
const model = require('../packages/model');
const users = require('../packages/users');

fuxor.add('anga-core', core);
fuxor.add('anga-admin', admin);
fuxor.add('anga-model', model);
fuxor.add('anga-users', users);

console.log('loaded');;
