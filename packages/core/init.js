process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : '*';

require('noobnoob');

const debug = require('debug')('anga:core');
const debugErr = require('debug')('anga:core:error');
const Glue = require('glue');
const fs = require('fs');
const Path = require('path');
const pMap = require('p-map');
const globby = require('globby');
const Users = require('anga-users');
const Admin = require('anga-admin');

const manifester = require('./manifest');

const fsPromises = fs.promises;
const options = {
  relativeTo: __dirname
};

let server;
const templatePaths = [];
const partialPaths = [];
module.exports = {
  load: async ({ INSTALLED_APPS, CONNECTION, NAME, DB }, config) => {
    debug('Params passed to LOAD', { INSTALLED_APPS, CONNECTION, NAME, DB });
    debug('conf', config);
    await Users.setup(CONNECTION, DB);

    const LOCAL_APPS = INSTALLED_APPS.filter(
      (app) => app.indexOf('anga-') === -1
    );

    const APPS_SETTINGS = await pMap(LOCAL_APPS, async (app) => {
      const setsFile = Path.join(process.cwd(), `/${app}/settings`);
      debug('Settings Files', setsFile);
      const settings = require(setsFile);
      const globbedApps = Path.join(process.cwd(), `/${app}/models/*.js`);
      debug('globbed apps', globbedApps);

      const models = await globby(globbedApps);
      settings.MODELS = models;
      settings.APP_ID = app;
      return settings;
    });
    debug('Apps Settings', APPS_SETTINGS);
    const manifest = await manifester(LOCAL_APPS, CONNECTION);
    //additionally this should take a configured manifest and merge it in with the default manifest
    debug('cwd', process.cwd());
    const subDirs = await fsPromises.readdir(process.cwd());

    await pMap(subDirs, async (dir) => {
      const stat = await fsPromises.stat(dir);
      if (
        stat.isDirectory() &&
        (dir !== 'node_modules' && dir.indexOf('.') !== 0)
      ) {
        //this will probably need a path join with cwd
        templatePaths.push(`./${dir}/templates`);
        partialPaths.push(`./${dir}/partials`);
      }
    });

    debug('Before compose', templatePaths);
    server = await Glue.compose(
      manifest,
      options
    );
    debug('After compose');

    templatePaths.push(Users.templates);
    templatePaths.push(Admin.templates);

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
    server.decorate('request', 'INSTALLED_APPS', INSTALLED_APPS);
    server.decorate('request', 'APP_NAME', NAME);
    server.decorate('server', 'INSTALLED_APPS', INSTALLED_APPS);
    server.decorate('request', 'APPS_SETTINGS', APPS_SETTINGS);
    server.decorate('server', 'APPS_SETTINGS', APPS_SETTINGS);
    debug('server setup complete');

    return server;
  },
  start: async () => {
    debug('Starting the server');
    await server.start();
    debug('Started');
    return server;
  },
  shutdown: async () => {
    try {
      await server.stop({
        timeout: 10000
      });
      debug('The ANGA web server stopped');
    } catch (err) {
      debugErr('Error stopping server', err);
      throw err;
    }
  }
};
