const Joi = require('joi');
const User = require('../models/user');
const Account = require('../models/account');
const Session = require('../models/session');
const Mailer = require('anga-mail');

const name = 'wherekura';

module.exports = [{
  method: 'GET',
  path: '/verify',
  config: {
    auth: false,
    tags: ['user'],
    validate: {
      failAction: (request, h, err) => {
        console.log('error', err);
        return err;
      },
      query: {
        key: Joi.string().required()
      }
    },
    pre: [{
      assign: 'token',
      method: async function (request, h) {
        console.log('request.payload', request.query.token);

        const updateUser = {
          $set: {
            isEmailVerified: true
          }
        };
        const user = await User.findByIdAndUpdate(request.query.token, updateUser);
        if (!user) {
          return h.conflict('Invalid');
        }

        return h.continue;
      }
    }, {
      assign: 'emailCheck',
      method: async function (request, h) {

        const user = await User.findByEmail(request.payload.email);

        if (user) {
          return h.conflict('Email already in use.');
        }

        return h.continue;
      }
    }],
    handler: async (request, h) => {
      return h.flash('Email Account verified, please login', '/login');
    }
  }
}, {
  method: 'POST',
  path: '/verify',
  config: {
    auth: false,
    tags: ['user'],
    validate: {
      failAction: (request, h, err) => {
        console.log('error', err);
        return err;
      },
      payload: {
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().required(),
        username: Joi.string().required(),
        name: Joi.string().required(),
      }
    },
    pre: [{
      assign: 'usernameCheck',
      method: async function (request, h) {
        console.log('request.payload', request.payload);
        const user = await User.findByUsername(request.payload.username);

        if (user) {
          return h.conflict('Username already in use.');
        }

        return h.continue;
      }
    }, {
      assign: 'emailCheck',
      method: async function (request, h) {

        const user = await User.findByEmail(request.payload.email);

        if (user) {
          return h.conflict('Email already in use.');
        }

        return h.continue;
      }
    }],

    handler: async (request, h) => {
      // create and link account and user documents

      let [account, user] = await Promise.all([
        Account.create(request.payload.name),
        User.create(
          request.payload.username,
          request.payload.password,
          request.payload.email
        )
      ]);

      [account, user] = await Promise.all([
        account.linkUser(`${user._id}`, user.username),
        user.linkAccount(`${account._id}`, account.fullName())
      ]);

      // send welcome email

      const emailOptions = {
        subject: `Your ${name} account`,
        to: {
          name: request.payload.name,
          address: request.payload.email
        }
      };

      try {
        await Mailer.sendEmail(emailOptions, 'users/welcome', request.payload);
      } catch (err) {
        console.error('email error', err);
        request.log(['mailer', 'error'], err);
      }

      // create session

      const userAgent = request.headers['user-agent'];
      const ip = request.remoteAddress;
      const session = await Session.create(`${user._id}`, ip, userAgent);

      // create auth header

      const credentials = `${session._id}:${session.key}`;
      const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;

      const result = {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        session,
        authHeader
      };

      return h.flash('Account created', '/login');
    }
  }
}];