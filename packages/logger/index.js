const loggerPlugin = {
  name: 'anga-logger',
  version: '1.0.0',
  once: true,
  register: (server, options) => {
    const logger = require('debug')(options.namespace || 'anga:logger');
    server.decorate('request', 'logger', logger);

    return;
  }
};

module.exports = loggerPlugin;
