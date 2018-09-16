const Nodemailer = require('nodemailer');

const transport = Nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '1dc481db3c0056',
    pass: '7e19b71b727cbe'
  }
});

module.exports = transport;
