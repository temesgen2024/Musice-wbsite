import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

export const sendmail = async (options) =>{
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        service: process.env.SMTP_SERVICE,

        
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        secure: true,
    });
    const { email, subject, template, data } = options;

    const templatePath = path.join(__dirname, "../mails", template);

    const html = await ejs.renderFile(templatePath, data);
    const mailOptions = {
        from: process.env.SMTP_FROM_NAME ,
        to: email,
        subject,
        html
    };


    await transporter.sendMail(mailOptions);
}

export default sendmail;