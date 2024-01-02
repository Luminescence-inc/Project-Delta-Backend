import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";

const clientBaseUrl = process.env.CLIENT_BASE_URL;
const source = fs.readFileSync('src/templates/email_template.html', 'utf-8').toString();
const template = handlebars.compile(source);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    }
});

export const generateVerificationEmail = (userId: string, userEmail: string, uniqueString: string, expiresUtc: number)=>{
    const date:any = new Date(expiresUtc);
    const currentTime:any = new Date();
    const replacements = {
        title: 'Account Verification Email',
        content: `Please click on the link below to verify your account and complete registration. Link will expire in ${Math.round((date - currentTime)/(1000*60*60))} hours`,
        link: `${clientBaseUrl + "/verify-email/" + userId + "/" + uniqueString}`
    }
    const htmlToSend = template(replacements);
    const ht = htmlToSend
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Verify Your Email",
        text: 'Verification Email',
        html: ht
    };

    return transporter.sendMail(mailOptions)
}

export const generateForgotPasswordEmail = (userId: string, userEmail: string, uniqueString: string, expiresUtc: number)=>{
    const date:any = new Date(expiresUtc);
    const currentTime:any = new Date();
    const replacements = {
        title: 'Reset Password Email',
        content: `Please click on the link below to Reset your password. Link will expire in ${Math.round((date - currentTime)/(1000*60*60))} hours`,
        link: `${clientBaseUrl + "/forgot-password/reset/" + userId + "/" + uniqueString}`
    }
    const htmlToSend = template(replacements);
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Reset Your Password",
        text: 'Reste Password Email',
        html: htmlToSend
    };

    return transporter.sendMail(mailOptions)
}


