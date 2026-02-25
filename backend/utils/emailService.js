const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Tourist Guide BD" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, 
    };

    if (html) {
      mailOptions.html = html;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: " + info.response);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    return false;
  }
};

const sendGuideVerificationEmail = async (email, name, isVerified) => {
    const statusText = isVerified ? "Approved" : "Rejected/Pending";
    const message = isVerified 
        ? "Congratulations! Your account has been verified. You can now start receiving tour bookings." 
        : "Your verification status has been updated. Please contact support for more details.";

    const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #28a745;">Hello, ${name}!</h2>
                <p style="font-size: 16px; color: #333;">${message}</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Status:</strong> <span style="color: ${isVerified ? '#28a745' : '#dc3545'};">${statusText}</span>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #888;">Thank you for being with <strong>Tourist Guide</strong>. Developed by Mia Fahad bin Kashem.</p>
            </div>
        `;

    return sendEmail(email, `Account Verification Status: ${statusText}`, message, htmlContent);
};

module.exports = {
    sendEmail,
    sendGuideVerificationEmail
};

