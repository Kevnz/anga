const AdminGroup = require('../models/admin-group');
const Joi = require('joi');
const Preware = require('../preware');

module.exports = [{
  method: 'GET',
  path: '/admin/api/admin-groups',
  options: {
    tags: ['api', 'admin-groups'],
    description: 'Get a paginated list of all admin groups. [Root Scope]',
    notes: 'Get a paginated list of all admin groups.',
    auth: {
      scope: 'admin'
    },
    validate: {
      query: {
        sort: Joi.string().default('_id'),
        limit: Joi.number().default(20),
        page: Joi.number().default(1)
      }
    },
    pre: [
      Preware.requireAdminGroup('root')
    ]
  },
  handler: async function (request, h) {

    const query = {};
    const limit = request.query.limit;
    const page = request.query.page;
    const options = {
      sort: AdminGroup.sortAdapter(request.query.sort)
    };

    return await AdminGroup.pagedFind(query, limit, page, options);
  }
}, {
  method: 'POST',
  path: '/admin/api/admin-groups',
  options: {
    tags: ['api', 'admin-groups'],
    description: 'Create a new admin group. [Root Scope]',
    notes: 'Create a new admin group.',
    auth: {
      scope: 'admin'
    },
    validate: {
      payload: {
        name: Joi.string().required()
      }
    },
    pre: [
      Preware.requireAdminGroup('root')
    ]
  },
  handler: async function (request, h) {

    return await AdminGroup.create(request.payload.name);
  }
}, {
  method: 'GET',
  path: '/admin/api/admin-groups/{id}',
  options: {
    tags: ['api', 'admin-groups'],
    description: 'Get an admin group by ID. [Root Scope]',
    notes: 'Get an admin group by ID.',
    validate: {
      params: {
        id: Joi.string().required().description('the id to get an admin group')
      }
    },
    auth: {
      scope: 'admin'
    },
    pre: [
      Preware.requireAdminGroup('root')
    ]
  },
  handler: async function (request, h) {

    const adminGroup = await AdminGroup.findById(request.params.id);

    if (!adminGroup) {
      return h.notFound('AdminGroup not found.');
    }

    return adminGroup;
  }
}, {
  method: 'PUT',
  path: '/admin/api/admin-groups/{id}',
  options: {
    tags: ['api', 'admin-groups'],
    description: 'Update an admin group by ID. [Root Scope]',
    notes: 'Update an admin group by ID.',
    auth: {
      scope: 'admin'
    },
    validate: {
      params: {
        id: Joi.string().invalid('root')
      },
      payload: {
        name: Joi.string().required()
      }
    },
    pre: [
      Preware.requireAdminGroup('root')
    ]
  },
  handler: async function (request, h) {

    const id = request.params.id;
    const update = {
      $set: {
        name: request.payload.name
      }
    };
    const adminGroup = await AdminGroup.findByIdAndUpdate(id, update);

    if (!adminGroup) {
      return h.notFound('AdminGroup not found.');
    }

    return adminGroup;
  }
}, {
  method: 'DELETE',
  path: '/admin/api/admin-groups/{id}',
  options: {
    tags: ['api', 'admin-groups'],
    description: 'Delete an admin group by ID. [Root Scope]',
    notes: 'Delete an admin group by ID.',
    auth: {
      scope: 'admin'
    },
    validate: {
      params: {
        id: Joi.string().invalid('root')
      }
    },
    pre: [
      Preware.requireAdminGroup('root')
    ]
  },
  handler: async function (request, h) {

    const adminGroup = await AdminGroup.findByIdAndDelete(request.params.id);

    if (!adminGroup) {
      return h.notFound('AdminGroup not found.');
    }

    return {
      message: 'Success.'
    };
  }
}, {
  method: 'PUT',
  path: '/admin/api/admin-groups/{id}/permissions',
  options: {
    tags: ['api', 'admin-groups'],
    description: 'Update an admin group\'s permissions. [Root Scope]',
    notes: 'Update an admin group\'s permissions.',
    auth: {
      scope: 'admin'
    },
    validate: {
      params: {
        id: Joi.string().invalid('root')
      },
      payload: {
        permissions: Joi.object().required()
      }
    },
    pre: [
      Preware.requireAdminGroup('root')
    ]
  },
  handler: async function (request, h) {

    const id = request.params.id;
    const update = {
      $set: {
        permissions: request.payload.permissions
      }
    };
    const adminGroup = await AdminGroup.findByIdAndUpdate(id, update);

    if (!adminGroup) {
      return h.notFound('AdminGroup not found.');
    }

    return adminGroup;
  }
}];
