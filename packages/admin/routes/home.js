const pMap = require('p-map');
const { inspect } = require('util');
module.exports = [
  {
    method: 'GET',
    path: '/admin',
    options: {
      tags: ['api', 'admin'],
      description: 'Admin section main page. [Root Scope]',
      notes: 'Admin section main page.',
      auth: {
        scope: 'admin'
      },
      validate: {},
      pre: []
    },
    handler: async (request, h) => {
      request.logger('app settings', request.APPS_SETTINGS);
      request.logger(
        'The apps',
        request.INSTALLED_APPS.filter(
          (app) => !(app === 'core' || app === 'admin' || app === 'users')
        )
      );

      const highMap = {};
      const models = await pMap(request.APPS_SETTINGS, async (app) => {
        const appModels = app.MODELS.map((m) => ({
          detail: require(m),
          app: app.APP_ID,
          path: m
        }));
        request.logger('App Models', appModels);
        const mappedModels = appModels.map((m) => {
          request.logger('App Model collection name', m.detail.collectionName);
          request.logger('App Model m', m);
          return {
            app: m.app,
            name: m.detail.name.toString(),
            collection: m.detail.collectionName,
            path: m.path
          };
        });

        highMap[app.APP_NAME] = mappedModels;
        return {
          [app.APP_NAME]: mappedModels
        };
      });
      const allThings = request.APPS_SETTINGS.map((app) => {
        app.MODEL_DETAILS = highMap[app.APP_NAME];

        //request.logger('the App MODEL_DETAILS'.app.MODEL_DETAILS);
        return app;
      });
      request.logger('app models', inspect(allThings, true, 6, true));
      return h.view('admin-home.html', {
        message: 'Learning stuff',
        title: `${request.APP_NAME} - Admin`,
        apps: allThings,
        models: models
      });
    }
  }
];
