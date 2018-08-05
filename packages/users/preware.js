class Preware {
  static requireAdminGroup(groups) {

    return {
      assign: 'ensureAdminGroup',
      method: function (request, h) {

        if (Object.prototype.toString.call(groups) !== '[object Array]') {
          groups = [groups];
        }

        const admin = request.auth.credentials.roles.admin;
        const groupFound = groups.some((group) => admin.isMemberOf(group));

        if (!groupFound) {
          return h.forbidden('Missing required group membership.');
        }

        return h.continue;
      }
    };
  };
}


Preware.requireNotRootUser = {
  assign: 'requireNotRootUser',
  method: function (request, h) {

    if (request.auth.credentials.user.username === 'root') {
      return h.forbidden('Not permitted for the root user.');
    }

    return h.continue;
  }
};


module.exports = Preware;
