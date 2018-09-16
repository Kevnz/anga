const Path = require('path');

module.exports = {
  templates: Path.join(__dirname, 'templates'),
  helpers: Path.join(__dirname, 'helpers'),
  partials: Path.join(__dirname, 'templates', 'partials'),
  routes: Path.join(__dirname, 'routes', '**.js').replace('/', ''),
  routesRelative: Path.relative(
    process.cwd(),
    Path.join(__dirname, 'routes', '**.js')
  )
};
