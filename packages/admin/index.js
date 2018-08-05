const Path = require('path');
console.log('IN ADMIN CWD', process.cwd());
console.log('the admin dir', __dirname);
console.log('THE ADMIN RELATIVE', Path.relative(process.cwd(), Path.join(__dirname, 'routes', '**.js')));
module.exports = {
  templates: Path.join(__dirname, 'templates'),
  helpers: Path.join(__dirname, 'helpers'),
  partials: Path.join(__dirname, 'templates', 'partials'),
  routes: Path.join(__dirname, 'routes', '**.js').replace('/', ''),
  routesRelative: Path.relative(process.cwd(), Path.join(__dirname, 'routes', '**.js'))
};