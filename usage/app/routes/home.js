const Todo = require('../models/todo');

module.exports = [
  {
    method: 'GET',
    path: '/',
    config: {
      auth: {
        mode: 'optional'
      },
      tags: ['user'],
      validate: {
        failAction: (request, h, err) => {
          console.log('There was an error unfortunately', err);
          return err;
        }
      },
      handler: async (request, h) => {
        request.logger('Main App Route');
        if (request.auth.valid) {
          const items = await Todo.findAllIncompleteByUser(
            request.auth.credentials.user._id.toString()
          );
          request.logger('items', items);
          return h.view('home.html', {
            message: 'Making Stuff',
            title: 'Anga - App',
            todos: items
          });
        }
        return h.view('home.html', {
          message: 'Making Stuff',
          title: 'Anga - App',
          todos: []
        });
      }
    }
  }
];
