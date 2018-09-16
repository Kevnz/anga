const fs = require('fs-extra');
const program = require('ast-query');
const prettier = require('prettier');

module.exports = async name => {
  const source = await fs.readFile('./settings.js', 'utf-8');
  const tree = program(source);
  const n = tree.assignment('module.exports');
  const instApps = n.value().key('INSTALLED_APPS');

  instApps.push(`'${name}'`);

  const code = prettier.format(tree.toString(), { singleQuote: true });
  await fs.writeFile('./settings.js', code, 'utf-8');
  return Promise.resolve();
};
