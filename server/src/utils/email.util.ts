import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import sendgrid from '@sendgrid/mail';
import fs from 'fs';
import { VerifyEmailData } from './reminder.utils';
import { EmailType } from '@prisma/client';
import { afterEffect } from './reminder.utils';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

const contactSupportTemplateSource = fs.readFileSync('src/templates/contact_support_template.html', 'utf-8').toString();
const clientBaseUrl = process.env.CLIENT_BASE_URL;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

export const generateVerificationEmail = (
  userId: string,
  userEmail: string,
  uniqueString: string,
  firstName: string
) => {
  return sendgrid.send({
    from: 'BizConnect24 <noreply@bizconnect24.com>',
    templateId: 'd-91087e5e16dc4548a7e85c769b79fcff', //might have to read from env or config file
    personalizations: [
      {
        to: `${userEmail}`,
        dynamicTemplateData: {
          firstName: `${firstName}`,
          link: `${clientBaseUrl + '/verify-email/' + userId + '/' + uniqueString}`,
        },
      },
    ],
  });
};

export const generateForgotPasswordEmail = (
  userId: string,
  userEmail: string,
  uniqueString: string,
  firstName: string
) => {
  return sendgrid.send({
    from: 'BizConnect24 <noreply@bizconnect24.com>',
    templateId: 'd-13b87dc92793431f97206f4b76058af5', //might have to read from env or config file
    personalizations: [
      {
        to: `${userEmail}`,
        dynamicTemplateData: {
          firstName: `${firstName}`,
          link: `${clientBaseUrl + '/forgot-password/reset/' + userId + '/' + uniqueString}`,
        },
      },
    ],
  });
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
