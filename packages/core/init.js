process.env.DEBUG = '*';
//require('noobnoob');
const debug = require('debug')('anga:core');
const Glue = require('glue');
const fs = require('fs');
const Path = require('path');
const pMap = require('p-map');
const MongoModels = require('mongo-models');
const globby = require('globby');
const Users = require('anga-users');
const Admin = require('anga-admin');
const MongodbMemoryServer = require('mongodb-memory-server').default;

const mongoServer = new MongodbMemoryServer({
  debug: true,
  instance: {
    dbName: 'anga',
    port: 27017
  }
});

const {
  inspect
} = require('util');
const {
  union
} = require('lodash');
const manifester = require('./manifest');

const fsPromises = fs.promises;
const options = {
  relativeTo: __dirname
};

let server;
const templatePaths = [];
const partialPaths = [];
module.exports = {
  load: async (INSTALLED_APPS, config) => {
    const inMemoryUri = await mongoServer.getConnectionString();

    await Users.setup(inMemoryUri);
    debug('uri', inMemoryUri);

    const LOCAL_APPS = INSTALLED_APPS.filter((app) => app.indexOf('anga-') === -1);

    const APPS_SETTINGS = await pMap(LOCAL_APPS, async (app) => {
      const setsFile = Path.join(process.cwd(), `/${app}/settings`);
      console.log('sets fie', setsFile);
      const settings = require(setsFile);
      const globbedApps = Path.join(process.cwd(), `/${app}/models/*.js`);
      debug('globbed apps', globbedApps);

      const models = await globby(globbedApps);
      settings.MODELS = models;
      settings.APP_ID = app;
      return settings;
    });
    console.log('settings', APPS_SETTINGS);
    const manifest = await manifester(LOCAL_APPS, inMemoryUri);
    //additionally this should take a configured manifest and merge it in with the default manifest
    debug('cwd', process.cwd());
    const subDirs = await fsPromises.readdir(process.cwd());

    await pMap(subDirs, async (dir) => {
      const stat = await fsPromises.stat(dir);
      if (stat.isDirectory() && (dir !== 'node_modules' && dir.indexOf('.') !== 0)) {
        //this will probably need a path join with cwd
        templatePaths.push(`./${dir}/templates`);
        partialPaths.push(`./${dir}/partials`);
      }
    });

    debug('Before compose', templatePaths);
    server = await Glue.compose(manifest, options);
    // const helperPaths = templatePaths.map(tp => `${tp}/helpers`);
    templatePaths.push(Users.templates);
    templatePaths.push(Admin.templates);
    debug('After compose');
    server.views({
      engines: {
        html: require('handlebars'),
        ejs: require('ejs')
      },
      relativeTo: __dirname,
      path: templatePaths,
      layout: true,
      layoutPath: templatePaths,
      helpersPath: [Users.helpers, Admin.helpers],
      partialsPath: [Users.partials, Admin.partials]
    });
    debug('load complete');
    server.decorate('request', 'INSTALLED_APPS', INSTALLED_APPS);
    server.decorate('server', 'INSTALLED_APPS', INSTALLED_APPS);
    server.decorate('request', 'APPS_SETTINGS', APPS_SETTINGS);
    server.decorate('server', 'APPS_SETTINGS', APPS_SETTINGS);
    return server;
  },
  start: async () => {
    //do something and start the server
    debug('Starting');
    await server.start();
    debug('Started');
    return server;
  },
  shutdown: async () => {
    await server.stop({
      timeout: 10000
    });
    console.log('The ANGA web server stopped');
    try {
      mongoServer.stop();
      console.log('mongo db server stopped');
    } catch (err) {
      console.error('Error stopping mongo', err);
    }
  }
};