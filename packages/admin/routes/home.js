const pMap = require('p-map');


module.exports = [{
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
    pre: [

    ]
  },
  handler: async function (request, h) {
    request.logger('The apps', request.INSTALLED_APPS.filter((app) => !(app === 'core' || app === 'admin' || app === 'users')));

    const highMap = {};
    const models = await pMap(request.APPS_SETTINGS, async (app) => {
      const appModels = app.MODELS.map(m => ({
        detail: require(m),
        path: m
      }));
      request.logger('App Models', appModels);
      const mappedModels = appModels.map((m) => {

        return {
          name: m.detail.name.toString(),
          collection: m.collectionName,
          path: m.path
        };
      });

      highMap[app.APP_NAME] = mappedModels;
      return {
        [app.APP_NAME]: mappedModels
      };
    });
    const allThings = request.APPS_SETTINGS.map(app => {
      app.MODEL_DETAILS = highMap[app.APP_NAME];
      return app;
    });
    request.logger('app models', allThings);
    return h.view('admin-home.html', {
      message: 'Learning stuff',
      title: 'Wharekura - Admin',
      apps: allThings,
      models: models
    });
  }
}];