const Joi = require('joi');
const Preware = require('../preware');
const Session = require('../models/session');

module.exports = [
  {
    method: 'GET',
    path: '/api/sessions',
    options: {
      tags: ['api', 'session'],
      description: 'Get a paginated list of all user sessions. [Root Scope]',
      notes: 'Get a paginated list of all user sessions.',
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
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function(request, h) {
      const query = {};
      const limit = request.query.limit;
      const page = request.query.page;
      const options = {
        sort: Session.sortAdapter(request.query.sort)
      };

      return await Session.pagedFind(query, limit, page, options);
    }
  },
  {
    method: 'GET',
    path: '/api/sessions/{id}',
    options: {
      tags: ['api', 'session'],
      description: 'Get a user session by ID. [Root Scope]',
      notes: 'Get a user session by ID.',
      validate: {
        params: {
          id: Joi.string()
            .required()
            .description('the id to get session')
        }
      },
      auth: {
        scope: 'admin'
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function(request, h) {
      const session = await Session.findById(request.params.id);

      if (!session) {
        return h.notFound('Session not found.');
      }

      return session;
    }
  },
  {
    method: 'DELETE',
    path: '/api/sessions/{id}',
    options: {
      tags: ['api', 'session'],
      description: 'Delete a user session by ID. [Root Scope]',
      notes: 'Delete a user session by ID.',
      validate: {
        params: {
          id: Joi.string()
            .required()
            .description('the id to delete a session')
        }
      },
      auth: {
        scope: 'admin'
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function(request, h) {
      const session = await Session.findByIdAndDelete(request.params.id);

      if (!session) {
        return h.notFound('Session not found.');
      }

      return {
        message: 'Success.'
      };
    }
  },
  {
    method: 'GET',
    path: '/api/sessions/my',
    options: {
      tags: ['api', 'session'],
      description: 'Get the logged-in user\'s session. [User Account Scope]',
      notes: 'Get the logged-in user\'s session.',
      auth: {
        scope: ['admin', 'account']
      }
    },
    handler: async function(request, h) {
      const query = {
        userId: `${request.auth.credentials.user._id}`
      };

      return await Session.find(query);
    }
  },
  {
    method: 'DELETE',
    path: '/api/sessions/my/{id}',
    handler: async function(request, h) {
      const currentSession = `${request.auth.credentials.session._id}`;

      if (currentSession === request.params.id) {
        return h.badRequest(
          'Cannot destroy your current session. Also see `/api/logout`.'
        );
      }

      const query = {
        _id: Session.ObjectID(request.params.id),
        userId: `${request.auth.credentials.user._id}`
      };

      await Session.findOneAndDelete(query);

      return {
        message: 'Success.'
      };
    }
  }
];
