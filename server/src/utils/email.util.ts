import nodemailer from "nodemailer";

const currenturl = "http://localhost:5005/api/"; //env: client url for password reset and/or verification email

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
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete your profile.</p><p>This link <b>expires in ${(date - currentTime)/(1000*60*60)} hours</b>.</p>
        <p>Click <a href=${currenturl + "user/verify/" + userId + "/" + uniqueString}>here</a></p>`
    };

    return transporter.sendMail(mailOptions)
}

export const generateForgotPasswordEmail = (userId: string, userEmail: string, uniqueString: string, expiresUtc: number)=>{
    const date:any = new Date(expiresUtc);
    const currentTime:any = new Date();
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Reset Your Password",
        html: `<p>Click this link to Reset your password.</p><p>This link <b>expires in ${(date - currentTime)/(1000*60*60)} hours</b>.</p>
        <p>Click <a href=${currenturl + "user/reset_password/" + userId + "/" + uniqueString}>here</a></p>`
    };

    return transporter.sendMail(mailOptions)
}


