'use strict';

const Fs = require('fs');
const Handlebars = require('handlebars');
const Hoek = require('hoek');
const Markdown = require('nodemailer-markdown').markdown;
const Nodemailer = require('nodemailer');
const Path = require('path');
const Util = require('util');

const consoleTransport = require('./transports/console');
const mailtrapTransport = require('./transports/mailtrap');
const readFile = Util.promisify(Fs.readFile);

class Mailer {
  static async renderTemplate(app, signature, context) {
    if (this.templateCache[signature]) {
      return this.templateCache[signature](context);
    }

    const filePath = Path.resolve(
      __dirname,
      `../${app}/emails/${signature}.hbs.md`
    );
    const options = {
      encoding: 'utf-8'
    };
    const source = await readFile(filePath, options);

    this.templateCache[signature] = Handlebars.compile(source);

    return this.templateCache[signature](context);
  }

  static async sendEmail(options, template, context) {
    const [app, file] = template.split('/');
    const content = await this.renderTemplate(app, file, context);

    options = Hoek.applyToDefaults(options, {
      from: 'kevin@isom.nz',
      markdown: content
    });
    console.log('send', options);
    return await this.transport.sendMail(options);
  }
}

Mailer.templateCache = {};
//Mailer.transport = Nodemailer.createTransport(consoleTransport);
Mailer.transport = consoleTransport;

Mailer.transport.use(
  'compile',
  Markdown({
    useEmbeddedImages: true
  })
);

module.exports = Mailer;
