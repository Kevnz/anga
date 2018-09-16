const _ = require('lodash');
const internals = {};
const logger = require('debug')('anga:errors');

internals.getRequestLevel = request =>
  _.get(request, 'response.output.statusCode', '')
    .toString()
    .substr(0, 1) === '5'
    ? 'error'
    : 'info';

internals.getRequestLevelNonBoom = request =>
  _.get(request, 'response.statusCode', '')
    .toString()
    .substr(0, 1) === '5'
    ? 'error'
    : 'info';
internals.getRequestData = (server, options, request, level) => {
  /* istanbul ignore next */
  const requestInfo = request.info || {};
  /* istanbul ignore next */
  const serverInfo = server.info || {};
  /* istanbul ignore next */
  const url =
    requestInfo.uri ||
    (requestInfo.host && `${serverInfo.protocol}://${requestInfo.host}`) ||
    serverInfo.uri;

  return {
    request: {
      method: request.method,
      query_string: request.query,
      headers: request.headers,
      cookies: request.state,
      url: url + request.path
    },
    extra: {
      timestamp: requestInfo.received,
      id: request.id,
      remotePort: requestInfo.remotePort
    },
    tags: options.tags,
    level
  };
};

const loggerPlugin = {
  name: 'anga-error-logger',
  version: '1.0.0',
  register: async function(server, options) {
    server.ext('onPreResponse', function(request, h) {
      const level = request.response.isBoom
        ? internals.getRequestLevel(request)
        : internals.getRequestLevelNonBoom(request);
      /* istanbul ignore next */
      const requestResponse = request.response || {};
      const captureDescription =
        level === 'error' ? requestResponse : requestResponse.message;
      /*
        if (request.response.isBoom && request.response.output.statusCode >= 400) {
          logger(
            captureDescription,
            internals.getRequestData(server, options, request, level)
          );
        } else if (!request.response.isBoom && request.response.statusCode >= 400) {
          logger(
            captureDescription,
            internals.getRequestData(server, options, request, level)
          );
        }
      */

      return h.continue;
    });
  }
};

module.exports = loggerPlugin;
