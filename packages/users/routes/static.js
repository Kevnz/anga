const Path = require('path');
module.exports = [{
  method: 'GET',
  path: '/assets/{param*}',
  options: {
    auth: false,
  },
  handler: {
    directory: {
      path: Path.resolve(__dirname, '../static/'),
      redirectToSlash: true,
      index: true,
    }
  }
}];