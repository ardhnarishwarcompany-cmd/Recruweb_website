import { GetStarted } from '../models/index.js';
   import { sendToHrms } from '../utils/hrmsBridge.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// This is the "Client Inquiry" form used by prospective client companies
export const createGetStarted = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, employees, services, message } = req.body;

    const submission = await GetStarted.create({
      companyName, contactPerson, email, phone, employees, services, message
    });
       // Sync to HRMS Website Forms (non-blocking, never breaks the form)
       sendToHrms({
         kind: "client_inquiry",
         externalId: `gs-${submission.id}`,
         name: contactPerson,
         email,
         phone,
         company: companyName,
         requirement: [
           employees ? `Employees: ${employees}` : "",
           services ? `Services: ${Array.isArray(services) ? services.join(", ") : services}` : "",
           message ? `Message: ${message}` : "",
         ].filter(Boolean).join("\n"),
         source: "get-started",
       });
    // Non-blocking email sending so it won't crash the request if SMTP is unconfigured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        await transporter.sendMail({
          from: `"Recruweb Website" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
          subject: `New Client Inquiry from ${companyName}`,
          html: `
            <h2>New Client Inquiry (Get Started)</h2>
            <p><strong>Company Name:</strong> ${companyName}</p>
            <p><strong>Contact Person:</strong> ${contactPerson}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Number of Employees:</strong> ${employees}</p>
            <p><strong>Services Required:</strong> ${services ? (Array.isArray(services) ? services.join(', ') : services) : 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${message || 'N/A'}</p>
          `
        });
      } catch (emailError) {
        console.log('Email sending failed (non-fatal):', emailError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your interest! Our team will contact you shortly.',
      data: submission
    });
  } catch (error) {
    console.error('GET_STARTED_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit request. Please try again.', error: error.message });
  }
};

export const getGetStartedSubmissions = async (req, res) => {
  try {
    const submissions = await GetStarted.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
};

export const getGetStarted = async (req, res) => {
  try {
    const submission = await GetStarted.findByPk(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch submission', error: error.message });
  }
};

export const updateGetStartedStatus = async (req, res) => {
  try {
    const submission = await GetStarted.findByPk(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    submission.status = req.body.status;
    await submission.save();
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update submission', error: error.message });
  }
};