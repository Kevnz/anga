const AuthAttempt = require('../models/auth-attempt');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const Mailer = require('anga-mail');
const Session = require('../models/session');
const User = require('../models/user');

module.exports = [
  {
    method: 'GET',
    path: '/login',
    config: {
      auth: false,
      tags: ['user'],
      validate: {
        failAction: (request, h, err) => {
          console.log('There was an error unfortunately', err);
          return err;
        }
      },
      handler: async (request, h) => {
        request.logger('Login route');
        const mess = h.flash();
        request.logger('Login route message', mess);
        return h.view('login.html', {
          messages: mess,
          message: 'Anga',
          title: 'Anga - Login'
        });
      }
    }
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      tags: ['api', 'login'],
      description: 'Log in with username and password. [No Scope]',
      notes: 'Log in with username and password.',
      auth: false,
      validate: {
        payload: {
          username: Joi.string()
            .lowercase()
            .required(),
          password: Joi.string().required()
        }
      },
      pre: [
        {
          assign: 'abuseDetected',
          method: async function(request, h) {
            const ip = request.remoteAddress;
            const username = request.payload.username;
            const detected = await AuthAttempt.abuseDetected(ip, username);

            if (detected) {
              return h.badRequest('Maximum number of auth attempts reached.');
            }

            return h.continue;
          }
        },
        {
          assign: 'user',
          method: async function(request, h) {
            const ip = request.remoteAddress;
            const username = request.payload.username;
            const password = request.payload.password;
            const user = await User.findByCredentials(username, password);

            if (!user) {
              await AuthAttempt.create(ip, username);

              return h.badRequest(
                'Credentials are invalid or account is inactive.'
              );
            }

            return user;
          }
        },
        {
          assign: 'session',
          method: async function(request, h) {
            const userId = `${request.pre.user._id}`;
            const ip = request.remoteAddress;
            const userAgent = request.headers['user-agent'];

            return await Session.create(userId, ip, userAgent);
          }
        }
      ]
    },
    handler: async function(request, h) {
      const sessionId = request.pre.session._id;
      const sessionKey = request.pre.session.key;
      const credentials = `${sessionId}:${sessionKey}`;
      const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
      const creds = `${Buffer.from(credentials).toString('base64')}`;

      const response = h.response({
        user: {
          _id: request.pre.user._id,
          username: request.pre.user.username,
          email: request.pre.user.email,
          roles: request.pre.user.roles
        },
        session: request.pre.session,
        authHeader
      });

      request.cookieAuth.set({
        id: creds
      });

      if (response) {
        response.header('Authorization', authHeader);
        return response;
      }
      return {
        user: {
          _id: request.pre.user._id,
          username: request.pre.user.username,
          email: request.pre.user.email,
          roles: request.pre.user.roles
        },
        session: request.pre.session,
        authHeader
      };
    }
  },
  {
    method: 'POST',
    path: '/users/login/forgot',
    options: {
      tags: ['api', 'login'],
      description: 'Trigger forgot password email. [No Scope]',
      notes: 'Trigger forgot password email.',
      auth: false,
      validate: {
        payload: {
          email: Joi.string()
            .email()
            .lowercase()
            .required()
        }
      },
      pre: [
        {
          assign: 'user',
          method: async function(request, h) {
            const query = {
              email: request.payload.email
            };
            const user = await User.findOne(query);

            if (!user) {
              const response = h.response({
                message: 'Success.'
              });

              return response.takeover();
            }

            return user;
          }
        }
      ]
    },
    handler: async function(request, h) {
      const keyHash = await Session.generateKeyHash();
      const update = {
        $set: {
          resetPassword: {
            token: keyHash.hash,
            expires: Date.now() + 10000000
          }
        }
      };

      await User.findByIdAndUpdate(request.pre.user._id, update);

      // send email

      const projectName = 'Anga';
      const emailOptions = {
        subject: `Reset your ${projectName} password`,
        to: request.payload.email
      };
      const template = 'user/forgot-password';
      const context = {
        key: keyHash.key
      };

      await Mailer.sendEmail(emailOptions, template, context);

      return {
        message: 'Success.'
      };
    }
  },
  {
    method: 'POST',
    path: '/users/login/reset',
    options: {
      tags: ['api', 'login'],
      description: 'Reset password with forgot password key. [No Scope]',
      notes: 'Reset password with forgot password key.',
      auth: false,
      validate: {
        payload: {
          email: Joi.string()
            .email()
            .lowercase()
            .required(),
          key: Joi.string().required(),
          password: Joi.string().required()
        }
      },
      pre: [
        {
          assign: 'user',
          method: async function(request, h) {
            const query = {
              email: request.payload.email,
              'resetPassword.expires': {
                $gt: Date.now()
              }
            };
            const user = await User.findOne(query);

            if (!user) {
              return h.badRequest('Invalid email or key.');
            }

            return user;
          }
        }
      ]
    },
    handler: async function(request, h) {
      // validate reset token

      const key = request.payload.key;
      const token = request.pre.user.resetPassword.token;
      const keyMatch = await Bcrypt.compare(key, token);

      if (!keyMatch) {
        return h.badRequest('Invalid email or key.');
      }

      // update user

      const password = request.payload.password;
      const passwordHash = await User.generatePasswordHash(password);
      const update = {
        $set: {
          password: passwordHash.hash
        },
        $unset: {
          resetPassword: undefined
        }
      };

      await User.findByIdAndUpdate(request.pre.user._id, update);

      return {
        message: 'Success.'
      };
    }
  }
];
