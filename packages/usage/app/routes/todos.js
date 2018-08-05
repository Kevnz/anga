const Todo = require('../models/todo');

module.exports = [{
  method: 'GET',
  path: '/api/todos',
  config: {
    auth: {
      scope: 'account'
    },
    tags: ['user'],
    validate: {
      failAction: (request, h, err) => {
        console.log('There was an error unfortunately', err);
        return err;
      }
    },
    handler: async (request, h) => {
      request.logger('ToDo API route');

      const items = await Todo.findAllIncompleteByUser(request.auth.credentials.user._id.toString());
      return items;
    }
  }
}];