const info = require('debug')('anga:core:info');
info('The Core');

module.exports = (config) => {
  const info = require('debug')(`${config.name}:info`);
  const warn = require('debug')(`${config.name}:warn`);
  const error = require('debug')(`${config.name}:error`);
  return {
    init: require('./init'),
    logger: {
      info,
      warn,
      error
    }
  };
};
