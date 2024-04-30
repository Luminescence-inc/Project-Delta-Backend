import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import sendgrid from '@sendgrid/mail';
import fs from 'fs';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

const contactSupportTemplateSource = fs.readFileSync('src/templates/contact_support_template.html', 'utf-8').toString();
const clientBaseUrl = process.env.CLIENT_BASE_URL;

const source = fs.readFileSync('src/templates/email_template.html', 'utf-8').toString();
const template = handlebars.compile(source);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// export const generateVerificationEmail = (
//   userId: string,
//   userEmail: string,
//   uniqueString: string,
//   expiresUtc: number
// ) => {
//   const date: any = new Date(expiresUtc);
//   const currentTime: any = new Date();
//   const replacements = {
//     title: 'Account Verification Email',
//     content: `Please click on the link below to verify your account and complete registration. Link will expire in ${Math.round(
//       (date - currentTime) / (1000 * 60 * 60)
//     )} hours`,
//     link: `${clientBaseUrl + '/verify-email/' + userId + '/' + uniqueString}`,
//   };
//   const htmlToSend = template(replacements);
//   const mailOptions = {
//     from: process.env.AUTH_EMAIL,
//     to: userEmail,
//     subject: 'Verify Your Email',
//     text: 'Verification Email',
//     html: htmlToSend,
//   };

//   return transporter.sendMail(mailOptions);
// };

export const generateVerificationEmail = (
  userId: string,
  userEmail: string,
  uniqueString: string,
  expiresUtc: number
) => {

  return sendgrid.send({
    from: 'BizConnect24 <noreply@bizconnect24.com>',
    templateId: 'd-91087e5e16dc4548a7e85c769b79fcff',
    personalizations:[
      {
        to: `${userEmail}`,
        dynamicTemplateData: {
          description: 'Dele is on the way!',
        },
      } 
     ],
  });
}

export const generateForgotPasswordEmail = (
  userId: string,
  userEmail: string,
  uniqueString: string,
  expiresUtc: number
) => {
  const date: any = new Date(expiresUtc);
  const currentTime: any = new Date();
  const replacements = {
    title: 'Reset Password Email',
    content: `Please click on the link below to Reset your password. Link will expire in ${Math.round(
      (date - currentTime) / (1000 * 60 * 60)
    )} hours`,
    link: `${clientBaseUrl + '/forgot-password/reset/' + userId + '/' + uniqueString}`,
  };
  const htmlToSend = template(replacements);
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: userEmail,
    subject: 'Reset Your Password',
    text: 'Reste Password Email',
    html: htmlToSend,
  };

  return transporter.sendMail(mailOptions);
};

export const generateSupportEmail = (
  personName: string,
  email: string,
  phoneNumber: string,
  problemDescription: string
) => {
  const template = handlebars.compile(contactSupportTemplateSource);
  const supportEmail = 'bizconnect24.help@gmail.com';
  const replacements = {
    personName,
    email,
    phoneNumber,
    problemDescription,
  };
  const htmlToSend = template(replacements);
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: supportEmail,
    subject: 'Customer Complaint',
    text: 'Please attend to this as soon as possible',
    html: htmlToSend,
  };

  return transporter.sendMail(mailOptions);
};
