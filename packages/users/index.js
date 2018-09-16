console.log('the users module', __dirname);
const Path = require('path');
const setup = require('./first-setup');

module.exports = {
  templates: Path.join(__dirname, 'templates'),
  helpers: Path.join(__dirname, 'templates', 'helpers'),
  partials: Path.join(__dirname, 'templates', 'partials'),
  routes: Path.join(__dirname, 'routes', '**.js').replace('/', ''),
  routesRelative: Path.relative(
    process.cwd(),
    Path.join(__dirname, 'routes', '**.js')
  ),
  setup
};
