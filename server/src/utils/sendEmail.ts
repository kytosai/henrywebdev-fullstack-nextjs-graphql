import nodemailer from 'nodemailer';

/*
  Doc: https://nodemailer.com/about
*/
// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async function (to: string, html: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // const testAccount = await nodemailer.createTestAccount();
  // console.log({ testAccount });

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'm4tfq5efywt7d4db@ethereal.email',
      pass: 'VyqTF6akEAdxyBphmC',
    },
    tls: {
      rejectUnauthorized: false, // avoid nodejs self signed certificate error
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <testgraphql@example.com>', // sender address
    to, // list of receivers
    subject: 'Change password', // Subject line
    html, // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
