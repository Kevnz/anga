const Admin = require('../models/admin');
const Account = require('../models/account');
const Joi = require('joi');
const Preware = require('../preware');
const User = require('../models/user');

module.exports = [
  {
    method: 'GET',
    path: '/admin/api/users',
    options: {
      cors: true,
      tags: ['api', 'users'],
      description: 'Get a paginated list of all users. [Root Scope]',
      notes: 'Get a paginated list of all users.',
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
      response: {
        schema: Joi.object({
          data: Joi.array().items(User.schema),
          items: Joi.object({
            limit: Joi.number(),
            begin: Joi.number(),
            end: Joi.number(),
            total: Joi.number()
          }),
          pages: Joi.object({
            current: Joi.number(),
            limit: Joi.number(),
            prev: Joi.number(),
            hasPrev: Joi.boolean(),
            next: Joi.number(),
            hasNext: Joi.boolean(),
            total: Joi.number()
          })
        }),
        failAction: (request, h, err) => {
          request.logger(err);
          return err;
        }
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function (request, h) {
      const query = {};
      const limit = request.query.limit;
      const page = request.query.page;
      const options = {
        sort: User.sortAdapter(request.query.sort)
      };

      const users = await User.pagedFind(query, page, limit, options);

      return users;
    }
  },
  {
    method: 'GET',
    path: '/admin/users',
    options: {
      tags: ['api', 'users'],
      description: 'Get a paginated list of all users. [Root Scope]',
      notes: 'Get a paginated list of all users.',
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
    handler: async function (request, h) {
      const query = {};
      const limit = request.query.limit;
      const page = request.query.page;
      const options = {
        sort: User.sortAdapter(request.query.sort)
      };

      const users = await User.pagedFind(query, page, limit, options);
      request.logger(users);
      return h.view('admin/users-list.html', {
        message: 'Learning stuff',
        title: 'Anga - Users',
        users: users.data
      });
    }
  },
  {
    method: 'POST',
    path: '/admin/api/users',
    options: {
      tags: ['api', 'users'],
      description: 'Create a new user. [Root Scope]',
      notes: 'Create a new user. This does not map this user to an account.',
      auth: {
        scope: 'admin'
      },
      validate: {
        payload: {
          username: Joi.string()
            .token()
            .lowercase()
            .required(),
          password: Joi.string().required(),
          email: Joi.string()
            .email()
            .lowercase()
            .required()
        }
      },
      pre: [
        Preware.requireAdminGroup('root'),
        {
          assign: 'usernameCheck',
          method: async function (request, h) {
            const user = await User.findByUsername(request.payload.username);

            if (user) {
              return h.conflict('Username already in use.');
            }

            return h.continue;
          }
        },
        {
          assign: 'emailCheck',
          method: async function (request, h) {
            const user = await User.findByEmail(request.payload.email);

            if (user) {
              return h.conflict('Email already in use.');
            }

            return h.continue;
          }
        }
      ]
    },
    handler: async function (request, h) {
      const username = request.payload.username;
      const password = request.payload.password;
      const email = request.payload.email;

      return await User.create(username, password, email);
    }
  },
  {
    method: 'GET',
    path: '/admin/api/users/{id}',
    options: {
      tags: ['api', 'users'],
      description: 'Get a user by ID. [Root Scope]',
      notes: 'Get a user by ID.',
      validate: {
        params: {
          id: Joi.string()
            .required()
            .description('the id to get the user')
        }
      },
      response: {
        schema: User.schema
      },
      auth: {
        scope: 'admin'
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function (request, h) {
      const user = await User.findById(request.params.id);

      if (!user) {
        return h.notFound('User not found.');
      }

      return user;
    }
  },
  {
    method: 'PUT',
    path: '/admin/api/users/{id}',
    options: {
      tags: ['api', 'users'],
      description: 'Update a user by ID. [Root Scope]',
      notes: 'Update a user by ID.',
      auth: {
        scope: 'admin'
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        },
        payload: {
          isActive: Joi.boolean().required(),
          username: Joi.string()
            .token()
            .lowercase()
            .required(),
          email: Joi.string()
            .email()
            .lowercase()
            .required()
        }
      },
      pre: [
        Preware.requireAdminGroup('root'),
        {
          assign: 'usernameCheck',
          method: async function (request, h) {
            const conditions = {
              username: request.payload.username,
              _id: {
                $ne: User._idClass(request.params.id)
              }
            };
            const user = await User.findOne(conditions);

            if (user) {
              return h.conflict('Username already in use.');
            }

            return h.continue;
          }
        },
        {
          assign: 'emailCheck',
          method: async function (request, h) {
            const conditions = {
              email: request.payload.email,
              _id: {
                $ne: User._idClass(request.params.id)
              }
            };
            const user = await User.findOne(conditions);

            if (user) {
              return h.conflict('Email already in use.');
            }

            return h.continue;
          }
        }
      ]
    },
    handler: async function (request, h) {
      const updateUser = {
        $set: {
          isActive: request.payload.isActive,
          username: request.payload.username,
          email: request.payload.email
        }
      };
      const queryByUserId = {
        'user.id': request.params.id
      };
      const updateRole = {
        $set: {
          'user.name': request.payload.username
        }
      };
      const user = await User.findByIdAndUpdate(request.params.id, updateUser);

      if (!user) {
        return h.notFound('User not found.');
      }

      await Promise.all([
        Account.findOneAndUpdate(queryByUserId, updateRole),
        Admin.findOneAndUpdate(queryByUserId, updateRole)
      ]);

      return user;
    }
  },
  {
    method: 'DELETE',
    path: '/admin/api/users/{id}',
    options: {
      tags: ['api', 'users'],
      description: 'Delete a user by ID. [Root Scope]',
      notes: 'Delete a user by ID.',
      auth: {
        scope: 'admin'
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        }
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function (request, h) {
      const user = await User.findByIdAndDelete(request.params.id);

      if (!user) {
        return h.notFound('User not found.');
      }

      return {
        message: 'Success.'
      };
    }
  },
  {
    method: 'PUT',
    path: '/admin/api/users/{id}/password',
    options: {
      tags: ['api', 'users'],
      description: 'Update a user password. [Root Scope]',
      notes: 'Update a user password.',
      auth: {
        scope: 'admin'
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        },
        payload: {
          password: Joi.string().required()
        }
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function (request, h) {
      const password = await User.generatePasswordHash(
        request.payload.password
      );
      const update = {
        $set: {
          password: password.hash
        }
      };
      const user = await User.findByIdAndUpdate(request.params.id, update);

      if (!user) {
        return h.notFound('User not found.');
      }

      return user;
    }
  },
  {
    method: 'GET',
    path: '/admin/api/users/my',
    options: {
      tags: ['api', 'users'],
      description:
        'Get the logged-in user\'s user details like roles. [User Account Scope]',
      notes: 'Get the logged-in user\'s user details like roles.',
      auth: {
        scope: ['admin', 'account']
      }
    },
    handler: async function (request, h) {
      const id = request.auth.credentials.user._id;
      const fields = User.fieldsAdapter('username email roles');

      return await User.findById(id, fields);
    }
  },
  {
    method: 'PUT',
    path: '/api/users/my',
    options: {
      tags: ['api', 'users'],
      description:
        'Update the logged-in user\'s user details like username and email. [User Account Scope]',
      notes:
        'Update the logged-in user\'s user details like username and email.',
      auth: {
        scope: ['admin', 'account']
      },
      validate: {
        payload: {
          username: Joi.string()
            .token()
            .lowercase()
            .required(),
          email: Joi.string()
            .email()
            .lowercase()
            .required()
        }
      },
      pre: [
        Preware.requireNotRootUser,
        {
          assign: 'usernameCheck',
          method: async function (request, h) {
            const conditions = {
              username: request.payload.username,
              _id: {
                $ne: request.auth.credentials.user._id
              }
            };
            const user = await User.findOne(conditions);

            if (user) {
              return h.conflict('Username already in use.');
            }

            return h.continue;
          }
        },
        {
          assign: 'emailCheck',
          method: async function (request, h) {
            const conditions = {
              email: request.payload.email,
              _id: {
                $ne: request.auth.credentials.user._id
              }
            };
            const user = await User.findOne(conditions);

            if (user) {
              return h.conflict('Email already in use.');
            }

            return h.continue;
          }
        }
      ]
    },
    handler: async function (request, h) {
      const userId = `${request.auth.credentials.user._id}`;
      const updateUser = {
        $set: {
          username: request.payload.username,
          email: request.payload.email
        }
      };
      const findOptions = {
        fields: User.fieldsAdapter('username email roles')
      };
      const queryByUserId = {
        'user.id': userId
      };
      const updateRole = {
        $set: {
          'user.name': request.payload.username
        }
      };
      const [user] = await Promise.all([
        User.findByIdAndUpdate(userId, updateUser, findOptions),
        Account.findOneAndUpdate(queryByUserId, updateRole),
        Admin.findOneAndUpdate(queryByUserId, updateRole)
      ]);

      return user;
    }
  },
  {
    method: 'PUT',
    path: '/api/users/my/password',
    options: {
      tags: ['api', 'users'],
      description: 'Update the logged-in user\'s password. [User Account Scope]',
      notes: 'Update the logged-in user\'s password.',
      auth: {
        scope: ['admin', 'account']
      },
      validate: {
        payload: {
          password: Joi.string().required()
        }
      },
      pre: [Preware.requireNotRootUser]
    },
    handler: async function (request, h) {
      const userId = `${request.auth.credentials.user._id}`;
      const password = await User.generatePasswordHash(
        request.payload.password
      );
      const update = {
        $set: {
          password: password.hash
        }
      };
      const findOptions = {
        fields: User.fieldsAdapter('username email')
      };

      return await User.findByIdAndUpdate(userId, update, findOptions);
    }
  },
  {
    method: 'GET',
    path: '/admin/users/{id}',
    options: {
      tags: ['api', 'users'],
      description: 'Get a user by ID. [Root Scope]',
      notes: 'Get a user by ID.',
      validate: {
        params: {
          id: Joi.string()
            .required()
            .description('the id to get the user')
        }
      },
      auth: {
        scope: 'admin'
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function (request, h) {
      const user = await User.findById(request.params.id);

      if (!user) {
        return h.notFound('User not found.');
      }

      return h.view('admin/user-details.html', {
        message: 'Learning stuff',
        title: 'Anga - User',
        user: user
      });
    }
  },
  {
    method: 'GET',
    path: '/admin/users/{id}/edit',
    options: {
      tags: ['api', 'users'],
      description: 'Get a user by ID. [Root Scope]',
      notes: 'Get a user by ID.',
      validate: {
        params: {
          id: Joi.string()
            .required()
            .description('the id to get the user')
        }
      },
      auth: {
        scope: 'admin'
      },
      pre: [Preware.requireAdminGroup('root')]
    },
    handler: async function (request, h) {
      const user = await User.findById(request.params.id);

      if (!user) {
        return h.notFound('User not found.');
      }

      return h.view('admin/user-edit.html', {
        message: 'Learning stuff',
        title: 'Anga - User',
        user: user
      });
    }
  }
];
