import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const emailTemplates = {
  verification: (name, url) => ({
    subject: 'Verify Your Doctor Hub Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #2563EB, #14B8A6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Doctor Hub</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Healthcare Platform</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Welcome, ${name}!</h2>
          <p style="color: #64748b; line-height: 1.6;">Thank you for registering with Doctor Hub. Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: linear-gradient(135deg, #2563EB, #14B8A6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, url) => ({
    subject: 'Reset Your Doctor Hub Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #2563EB, #14B8A6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Doctor Hub</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b;">Password Reset Request</h2>
          <p style="color: #64748b; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: #EF4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  appointmentConfirmed: (patientName, doctorName, date, time) => ({
    subject: 'Appointment Confirmed - Doctor Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #2563EB, #14B8A6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Doctor Hub</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #dcfce7; color: #16a34a; padding: 8px 20px; border-radius: 20px; font-weight: 600;">✓ Appointment Confirmed</span>
          </div>
          <h2 style="color: #1e293b;">Your appointment is confirmed!</h2>
          <p style="color: #64748b;">Dear ${patientName}, your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0; color: #1e293b;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0; color: #1e293b;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 8px 0; color: #1e293b;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          </div>
        </div>
      </div>
    `,
  }),

  prescriptionReady: (patientName, doctorName) => ({
    subject: 'Prescription Ready - Doctor Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #2563EB, #14B8A6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Doctor Hub</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b;">Your Prescription is Ready</h2>
          <p style="color: #64748b;">Dear ${patientName}, Dr. ${doctorName} has added a new prescription for you.</p>
          <p style="color: #64748b;">Login to Doctor Hub to view and download your prescription.</p>
        </div>
      </div>
    `,
  }),
};

export const sendEmail = async ({ to, template, data }) => {
  try {
    const transporter = createTransporter();
    const templateFn = emailTemplates[template];

    if (!templateFn) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = templateFn(...data);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Doctor Hub <noreply@doctorhub.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    // Don't throw — email failure shouldn't break the main flow
    return null;
  }
};
