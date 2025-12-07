import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
export const createEmailTransporter = () => {
  const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error(`❌ Missing email environment variables: ${missingVars.join(', ')}`);
    return null;
  }
  const config: any = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  };
  if (process.env.EMAIL_PORT !== '465') {
    config.tls = {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      minVersion: 'TLSv1.2'
    };
  }
  config.pool = true;
  config.maxConnections = 5;
  config.maxMessages = 10;
   const transporter=  nodemailer.createTransport(config);
  return transporter as any;
};
