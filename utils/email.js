const nodemailer = require("nodemailer");
const ejs = require('ejs')
const htmToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email,
    this.firstName = user.name.split(' ')[0],
    this.url = url,
    this.from = `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    // Render HTML template
    const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    })

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to, 
      subject,
      html,
      text: htmToText.fromString(html)
    };

    // Create transport and send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Page!')
  }

  async sendResetPassword() {
    await this.send('resetPassword', 'Your password reset token')
  }
}
