const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // জিমেইলের বদলে এখন ব্রেভো হোস্ট
  port: 587,
  auth: {
    user: process.env.EMAIL_USER, // রেন্ডারে দেওয়া ব্রেভো মেইল
    pass: process.env.EMAIL_PASS, // রেন্ডারে দেওয়া ব্রেভো SMTP Key
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  const mailOptions = {
    from: `"Tourist Guide BD" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  // ইমেইল যেন বুকিং আটকে না দেয় সেজন্য .then() ব্যবহার করছি
  transporter.sendMail(mailOptions)
    .then(info => console.log("✅ Email sent via Brevo: " + info.response))
    .catch(err => console.log("❌ Brevo Error: " + err.message));

  return true; 
};

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, 
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     // এটি রেন্ডারের নেটওয়ার্ক ব্লকিং এড়াতে সাহায্য করতে পারে
//     rejectUnauthorized: false,
//     minVersion: "TLSv1.2"
//   },
//   pool: true, // কানেকশন ধরে রাখার জন্য
// });


// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// const sendEmail = async (to, subject, text, html = null) => {
//   const mailOptions = {
//     from: `"Tourist Guide BD" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//     html
//   };

//   transporter.sendMail(mailOptions)
//     .then(info => console.log("✅ Email sent successfully"))
//     .catch(err => console.error("❌ Email failed:", err.message));

//   return true; 
// };

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




