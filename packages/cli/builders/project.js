const ora = require('ora');
const { promisify } = require('util');
const path = require('path');
const npm = require('npm-programmatic');
const to = require('to-case');
const fs = require('fs-extra');
const exec = promisify(require('child_process').exec);
const writeFile = promisify(fs.writeFile);
const editorconfig = require(`../templates/editorconfig`);
const eslintrc = require(`../templates/eslint`);
const gitignore = require(`../templates/gitignore`);

const createProjectDirectory = async (name) => {
  const cased = to.slug(name).toLowerCase();
  const pathName = `./${cased}`;
  await fs.ensureDir(pathName);
  return pathName;
};

const addUtilFiles = async (root) => {
  await writeFile(`${root}/.eslintrc.json`, eslintrc);
  await writeFile(`${root}/.editorconfig`, editorconfig);
  await writeFile(`${root}/.gitignore`, gitignore);
  await writeFile(`${root}/.npmrc`, npmrc);
};

const npmInit = async (root) => {
  const newCWD = path.resolve(process.cwd(), root);
  const { stdout, stderr } = await exec('npm init -y', { cwd: newCWD });
  return null;
};

const npmInstall = async (root) => {
  const newCWD = path.resolve(process.cwd(), root);
  await npm.install(
    [
      'anga-admin@1',
      'anga-core@1',
      'anga-model@1',
      'anga-users@1',
      'handlebars',
      'hoek',
      'joi',
      'joistick'
    ],
    {
      save: true,
      cwd: newCWD
    }
  );
  await npm.install(
    [
      'eslint',
      'eslint-plugin-node',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
      'jest-cli',
      'nodemon'
    ],
    {
      saveDev: true,
      cwd: newCWD
    }
  );
};

const addNpmScripts = async (root) => {
  const p = await fs.readJSON(`${root}/package.json`);
  p.scripts = {
    test: 'jest',
    'test:watch': 'jest --watchAll',
    watch: 'nodemon ./index.js',
    dev: 'npm run test:watch & npm run watch',
    start: 'node ./index.js'
  };
  await fs.writeJson(`${root}/package.json`, p, { spaces: 2 });
};

const buildProject = async (name, options) => {
  const spinner = ora({
    text: 'Creating Project',
    spinner: 'bouncingBar'
  }).start();
  const cased = to.dot(name);
  const root = await createProjectDirectory(name);
  await addUtilFiles(root);
  await addServer(root, cased);
  await addDockerfiles(root);
  await npmInit(root);
  await npmInstall(root);
  await addNpmScripts(root);
  await addSettingsAndSecretsFiles(root);
  spinner.succeed('Project created');
  return true;
};

module.exports = buildProject;
