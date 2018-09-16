const inquirer = require('inquirer');
const projectBuilder = require('../builders/project');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your project?'
    }
  ])
  .then(async answers => {
    console.log('Preparing to create service');
    await projectBuilder(answers.name);
  });
