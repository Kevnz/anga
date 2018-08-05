'use strict';

const Hoek = require('hoek');

// Declare internals
const internals = {};

internals.defaults = {
  sessionId: 'sid',
  segment: 'flash',
  expires: 5 * 60 * 1000, // 5 minutes
  cache: {}
};

const register = function (server, options) {

  const settings = Hoek.applyToDefaults(internals.defaults, options);
  settings.cache = server.cache({
    segment: settings.segment,
    expiresIn: settings.expires
  });

  const flash = function (message, destination) {
    console.log('the flash this', arguments);
    let reply = this;
    let request = reply.request;
    let store = request.yar.get('anga-flash');
    console.log('store', store);
    if (message) { //We're writing - so add the message to the stack
      if (store && store.messages) {
        if (Array.isArray(message)) {
          // 'apply' takes an array of arguments as its second parameter, and so in this case
          // the array, is an array, and so all of its values will get pushed onto 'store.messages'
          // (onto the existing array, and not a new array as in 'concat').
          store.messages.push.apply(store.messages, message);
        } else {
          store.messages.push(message);
        }
        request.yar.set('anga-flash', store);
        if (destination) {
          console.log('the redirect');
          return reply.redirect(destination);
        }
      } else {
        request.yar.set('anga-flash', {
          messages: [message]
        });
        if (destination) {
          console.log('the redirect 2');
          return reply.redirect(destination);
        }
      }
    } else { //We're reading -  so return and then clear all messages
      if (store && store.messages) {
        let messages = Hoek.clone(store.messages);
        store.messages = [];
        request.yar.set('anga-flash', store);
        return messages;
      } else {
        return [];
      }
    }
    return reply.continue;
  };

  server.decorate('toolkit', 'flash', flash);

  server.ext('onPostAuth', function (request, h) {
    return h.continue;
  });
};
// Store any messages in the cache

module.exports = {
  name: 'anga-flash',
  version: '1.0.0',
  register
};
