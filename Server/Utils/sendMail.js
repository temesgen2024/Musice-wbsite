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
        secure: process.env.SMTP_SECURE === 'true',

        
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const templatePath = path.join(__dirname, '../mails', options.template);

    const html = await ejs.renderFile(templatePath, options.data);
    const mailOptions = {
        from: process.env.SMTP_FROM_NAME ,
        to: options.email,
        subject: options.subject,
        html
    };


    await transporter.sendMail(mailOptions);
}