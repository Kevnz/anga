const Joi = require('joi');
const Mailer = require('anga-mail');


module.exports = [{
  method: 'POST',
  path: '/contact',
  options: {
    tags: ['api', 'contact'],
    description: 'Generate a contact email. [No Scope]',
    notes: 'Generate a contact email.',
    auth: false,
    validate: {
      failAction: (request, h, err) => {
        console.log('There was an error unfortunately', err);
        return err;
      },
      payload: {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        message: Joi.string().required()
      }
    }
  },
  handler: async function (request, h) {

    const emailOptions = {
      subject: 'Anga contact form',
      to: 'kevin@isom.nz',
      replyTo: {
        name: request.payload.name,
        address: request.payload.email
      }
    };
    const template = 'users/contact';

    await Mailer.sendEmail(emailOptions, template, request.payload);

    return {
      message: 'Success.'
    };
  }
}, {
  method: 'GET',
  path: '/contact',
  config: {
    auth: false,
    tags: ['user'],
    validate: {
      failAction: (request, h, err) => {
        console.log('There was an error unfortunately', err);
        return err;
      }
    },
    handler: async (request, h) => {
      request.logger('Contact Form route');
      return h.view('contact.html', {
        message: 'Learning stuff',
        title: 'Anga - Contact'
      });
    }
  }
}];