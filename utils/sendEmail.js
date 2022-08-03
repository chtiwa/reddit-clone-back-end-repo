const nodeoutlook = require('nodejs-nodemailer-outlook');
const sendEmail = (options) => {
  nodeoutlook.sendEmail({
    auth: {
      user: process.env.OUTLOOK_EMAIL,
      pass: process.env.OUTLOOK_PASS
    },
    from: process.env.OUTLOOK_EMAIL,
    to: options.to,
    subject: 'Password reset',
    // html: '<b>This is bold text</b>',
    text: options.text,
    // onError: (e) => console.log(e),
    // onSuccess: (i) => console.log(i)
    onError: (e) => (e),
    onSuccess: (i) => (i)
  })
}

module.exports = sendEmail