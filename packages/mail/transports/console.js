const Nodemailer = require('nodemailer');

const transport = Nodemailer.createTransport({
  name: 'anga-console',
  version: '1.0.0',
  send: (mail, callback) => {
    let input = mail.message.createReadStream();
    input.pipe(process.stdout);
    input.on('end', function () {
      callback(null, true);
    });
  }
});


module.exports = transport;