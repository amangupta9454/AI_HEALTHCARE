const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure you have dotenv to load environment variables
const sendEmail = async (to, subject, appointment, action) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const statusMessage = {
      created: 'Your appointment has been booked successfully.',
      accepted: 'Your appointment has been accepted by the doctor.',
      rejected: 'Your appointment has been rejected by the doctor.',
      rescheduled: 'Your appointment has been rescheduled.',
      cancelled: 'Your appointment has been cancelled.',
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50;">HealthcareApp Appointment Update</h2>
        <p>Dear ${to.includes(appointment.email) ? appointment.patientName : appointment.doctorName},</p>
        <p>${statusMessage[action] || 'Your appointment details have been updated.'}</p>
        <h3 style="color: #3498db;">Appointment Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f9f9f9;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Field</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Details</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Patient Name</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointment.patientName}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Doctor Name</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointment.doctorName}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Date</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(appointment.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Time</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointment.time}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Status</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointment.status}</td>
          </tr>
          ${appointment.prescription ? `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Prescription</td>
            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${appointment.prescription}" target="_blank">View Prescription</a></td>
          </tr>` : ''}
        </table>
        <h3 style="color: #3498db;">Appointment Rules</h3>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Please arrive 10 minutes before your scheduled time.</li>
          <li>Bring a valid ID and any relevant medical records.</li>
          <li>Cancellations must be made 24 hours in advance.</li>
          <li>Contact support at support@healthcareapp.com for assistance.</li>
        </ul>
        <p style="margin-top: 20px;">Best regards,<br>HealthcareApp Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"HealthcareApp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };