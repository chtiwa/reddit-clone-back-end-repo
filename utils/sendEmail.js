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
    text: options.text,
    onError: (e) => (e),
    onSuccess: (i) => (i)
  })
}

module.exports = sendEmail