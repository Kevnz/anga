const Session = require('anga-users/models/session');
const User = require('anga-users/models/user');
const register = function(server, options) {
  server.auth.strategy('session', 'cookie', {
    password: 'password-should-be-32-characters',
    cookie: 'sid',
    redirectTo: '/login',
    isSecure: false,
    validateFunc: async (request, session) => {
      const buff = Buffer.from(session.id, 'base64');
      const text = buff.toString('ascii');
      const [sessionId, sessionKey] = text.split(':');

      const out = {
        valid: !!text
      };

      if (out.valid) {
        //out.credentials = cached.account;
      }
      const sessionInstance = await Session.findByCredentials(
        sessionId,
        sessionKey
      );

      if (!sessionInstance) {
        return {
          valid: false
        };
      }

      sessionInstance.updateLastActive();

      const user = await User.findById(sessionInstance.userId);

      if (!user) {
        return {
          valid: false
        };
      }

      if (!user.isActive) {
        return {
          valid: false
        };
      }

      const roles = await user.hydrateRoles();
      const credentials = {
        scope: Object.keys(user.roles),
        roles,
        session,
        user
      };

      return {
        credentials,
        valid: true
      };
    }
  });
  server.auth.default('session');
};

module.exports = {
  name: 'user-auth',
  dependencies: ['hapi-auth-cookie', 'anga-models-loader'],
  register
};
