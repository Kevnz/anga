const Path = require('path');
const globby = require('globby');
const debug = require('debug')('anga:manifest');
const userModels = require('anga-users/models');
const users = require('anga-users');
const admin = require('anga-admin');

module.exports = async (apps, inMemoryUri) => {
  debug('admin routes', admin.routes);
  debug('user routes', users.routes);
  //await init(inMemoryUri);
  debug('cwd', process.cwd());
  const globbedApps = apps.map(app =>
    Path.join(process.cwd(), `/${app}/models/*.js`).replace('/', '')
  );
  console.log('globbedApps', globbedApps);
  const models = await globby(globbedApps);
  const globbedRoutes = apps.map(app =>
    Path.relative(
      process.cwd(),
      Path.join(process.cwd(), `/${app}/routes/*.js`)
    )
  );

  const routes = globbedRoutes.concat(
    users.routesRelative,
    admin.routesRelative
  );
  debug('The routes to load', routes);

  const pluginRegistration = [
    {
      plugin: require('blipp')
    },
    {
      plugin: require('inert')
    },
    {
      plugin: require('vision')
    },
    {
      plugin: require('hapi-remote-address')
    },
    {
      plugin: require('hapi-auth-cookie')
    },
    {
      plugin: require('hapi-boom-decorators')
    },
    {
      plugin: require('yar'),
      options: {
        storeBlank: false,
        cookieOptions: {
          password: 'the-password-must-be-at-least-32-characters-long', //config passed in?
          isSecure: false
        }
      }
    },
    {
      plugin: require('anga-auth')
    },
    {
      plugin: 'anga-models-loader',
      options: {
        mongodb: {
          connection: {
            uri: 'mongodb://localhost:27017/',
            db: 'anga'
          }
        },
        models: models.concat(userModels),
        autoIndex: true
      }
    },
    {
      plugin: require('anga-logger')
    },
    /* {
       plugin: './plugins/route-logger'
     }, {
       plugin: './plugins/error-logger'
     }, {
       plugin: './plugins/no-auth-window'
     }, {
       plugin: './plugins/cors-headers'
     }, */
    {
      plugin: require('anga-flash')
    },
    {
      plugin: require('hapi-router'),
      options: {
        routes: routes
      }
    }
  ];

  return {
    server: {
      port: 4567 || process.env.PORT,
      cache: [
        {
          name: 'mongoCache',
          engine: require('catbox-mongodb'),
          uri: inMemoryUri,
          partition: 'cache'
        }
      ],
      routes: {
        cors: {
          origin: ['*'],
          additionalHeaders: [
            'x-requested-with',
            'accept-language',
            'token',
            'Content-Range',
            'content-range'
          ]
        }
      },
      router: {
        stripTrailingSlash: true
      }
    },
    register: {
      plugins: pluginRegistration.concat()
    }
  };
};
