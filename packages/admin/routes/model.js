const Joi = require('joi');

const getModel = async (request) => {
  console.log('request.params.model', request.params.model);
  const app = request.APPS_SETTINGS.filter(
    (app) => app.APP_ID === request.params.appName
  )[0];
  const model = app.MODELS.filter((model) => {
    const m = require(model);
    console.log('m?', model);
    console.log('collection name?', m.collectionName);
    console.log('request.params.model', request.params.model);
    return m.collectionName === request.params.model;
  })[0];
  console.log('The model?', model);
  const Model = require(model);
  return Model;
};

module.exports = [
  {
    method: 'GET',
    path: '/admin/data/{appName}/{model}',
    options: {
      tags: ['api', 'admin'],
      description: 'Admin section main page. [Root Scope]',
      notes: 'Admin section main page.',
      auth: {
        scope: 'admin'
      },
      validate: {},
      pre: [
        {
          assign: 'model',
          method: getModel
        }
      ]
    },
    handler: async (request) => {
      const Model = request.pre.model;

      const query = {};
      const limit = request.query.limit;
      const page = request.query.page;

      const options = {
        sort: Model.sortAdapter(request.query.sort)
      };
      const schema = Model.schema;
      const dataItems = await Model.pagedFind(query, page, limit, options);

      const description = Joi.describe(schema);
      console.log('model description', description.children);
      const keys = Object.keys(description.children);
      console.log('keys', keys);
      return {
        name: Model.name.toString(),
        data: dataItems,
        keys,
        description: description.children
      };
    }
  },
  {
    method: 'POST',
    path: '/admin/data/{appName}/{model}',
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
      console.log('the post');
      const app = request.APPS_SETTINGS.filter(
        (app) => app.APP_ID === request.params.appName
      )[0];
      const model = app.MODELS.filter((model) => {
        const m = require(model);
        return m.collectionName === request.params.model;
      })[0];

      const Model = require(model);
      const document = new Model(request.payload);
      console.log('model', document);
      const doc = await Model.insertOne(document);
      console.log('doc', doc);
      return h.flash(
        `${Model.name} created`,
        `/admin/data/${request.params.appName}/${request.params.model}`
      );
    }
  },
  {
    method: 'GET',
    path: '/admin/data/{appName}/{model}/{id}',
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
      const app = request.APPS_SETTINGS.filter(
        (app) => app.APP_ID === request.params.appName
      )[0];
      const model = app.MODELS.filter((model) => {
        const m = require(model);
        return m.collectionName === request.params.model;
      })[0];

      const Model = require(model);
      const item = await Model.findById(request.params.id);

      return {
        name: Model.name.toString(),
        [Model.name]: item
      };
    }
  },
  {
    method: 'GET',
    path: '/admin/view/{appName}/{model}',
    options: {
      tags: ['api', 'admin'],
      description: 'Admin section main page. [Root Scope]',
      notes: 'Admin section main page.',
      auth: {
        scope: 'admin'
      },
      validate: {},
      pre: [
        {
          assign: 'model',
          method: getModel
        }
      ]
    },
    handler: async (request, h) => {
      console.log('get the model');
      const Model = request.pre.model;

      const query = {};
      const limit = request.query.limit;
      const page = request.query.page;

      const options = {
        sort: Model.sortAdapter(request.query.sort)
      };
      const schema = Model.schema;
      console.log(Model);
      const dataItems = await Model.pagedFind(query, page, limit, options);

      const description = Joi.describe(schema);
      console.log('model description', description.children);
      const keys = Object.keys(description.children);
      console.log('keys', keys);
      console.log('dataitmes', dataItems);
      const data = {
        appName: request.params.appName,
        name: Model.name.toString(),
        modelName: request.params.model,
        records: dataItems.data,
        attrs: keys,
        description: description.children
      };
      console.log('data', data);
      return h.view('list.html', {
        message: 'Learning stuff',
        title: 'Wharekura - Admin',
        messages: h.flash(),
        data
      });
    }
  },
  {
    method: 'GET',
    path: '/admin/view/{appName}/{model}/new',
    options: {
      tags: ['api', 'admin'],
      description: 'Admin section main page. [Root Scope]',
      notes: 'Admin section main page.',
      auth: {
        scope: 'admin'
      },
      validate: {},
      pre: [
        {
          assign: 'model',
          method: getModel
        }
      ]
    },
    handler: async (request, h) => {
      console.log('get the model');
      const Model = request.pre.model;
      const schema = Model.schema;

      const description = Joi.describe(schema);
      console.log('model description', description.children);
      const keys = Object.keys(description.children);
      console.log('keys', keys);
      const data = {
        appName: request.params.appName,
        name: Model.name.toString(),
        modelName: Model.name.toString().toLowerCase(),
        attrs: keys,
        description: description.children
      };
      console.log('data', data);
      return h.view('new.html', {
        message: 'Making things',
        title: 'Anga - Admin',
        data
      });
    }
  },
  {
    method: 'POST',
    path: '/admin/view/{appName}/{model}/new',
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
      console.log('the post', request.payload);
      const app = request.APPS_SETTINGS.filter(
        (app) => app.APP_ID === request.params.appName
      )[0];
      const model = app.MODELS.filter((model) => {
        const m = require(model);
        return m.collectionName === request.params.model;
      })[0];
      try {
        const Model = require(model);
        const document = new Model(request.payload);
        console.log('model', document);
        const [doc] = await Model.insertOne(document);
        request.logger('Doc saved', doc);
        if (doc.linkUser) {
          console.log('link user');
          request.logger('User', request.auth.credentials.user);
          await doc.linkUser(request.auth.credentials.user._id.toString());
        }
        const items = await Model.find({});
        console.log('items', items);

        return h.flash(
          `${Model.name} created`,
          `/admin/view/${request.params.appName}/${request.params.model}`
        );
      } catch (err) {
        console.log('ERROR FAILED', err);
        return h.flash(
          `${request.params.model} failed`,
          `/admin/view/${request.params.appName}/${request.params.model}`
        );
      }
    }
  },
  {
    method: 'PUT',
    path: '/admin/view/{appName}/{model}/{id}',
    options: {
      tags: ['api', 'admin'],
      description: 'Admin section main page. [Root Scope]',
      notes: 'Admin section main page.',
      auth: {
        scope: 'admin'
      },
      validate: {},
      pre: [
        {
          assign: 'model',
          method: getModel
        }
      ]
    },
    handler: async (request, h) => {
      const app = request.APPS_SETTINGS.filter(
        (app) => app.APP_ID === request.params.appName
      )[0];
      const model = app.MODELS.filter((model) => {
        const m = require(model);
        return m.collectionName === request.params.model;
      })[0];
      try {
        const updateModel = {
          $set: request.payload
        };
        const Model = require(model);
        await Model.findByIdAndUpdate(request.params.id, updateModel);

        return h.flash(
          `${Model.name} updated`,
          `/admin/view/${request.params.appName}/${request.params.model}`
        );
      } catch (err) {
        console.log('ERROR FAILED', err);
        return h.flash(
          `${request.params.model} failed`,
          `/admin/view/${request.params.appName}/${request.params.model}`
        );
      }
    }
  }
];
