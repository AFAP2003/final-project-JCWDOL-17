import nodemailer from 'nodemailer';
import { SMTP_PASSWORD, SMTP_USER } from './config';

export const mailerclient = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});
