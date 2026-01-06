import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,           // smtp-relay.brevo.com
  port: Number(process.env.EMAIL_PORT),   // 587
  secure: false,                          // TLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,         // Brevo SMTP username
    pass: process.env.EMAIL_PASS,         // Brevo SMTP key
  },
});



// ----------------------------
// 2. Base Send Email Function
// ----------------------------
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // ✅ IMPORTANT
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email Sending Error:", err.message);
    throw err; // allow controller to handle if needed
  }
};

// ----------------------------
// 3. OTP Email
// ----------------------------
export const sendOtpEmail = async (to, otp) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>OTP Verification</title>
    </head>
    <body style="font-family: Arial; background:#f4f6f8; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; padding:24px; border-radius:8px;">
        <h2 style="color:#0f172a;">OTP Verification</h2>
        <p>Your OTP is valid for <b>10 minutes</b>:</p>
        <div style="font-size:28px; font-weight:bold; letter-spacing:6px; background:#f1f5f9; padding:12px; text-align:center;">
          ${otp}
        </div>
        <p style="color:#dc2626; font-size:13px;">
          ⚠️ Do not share this OTP with anyone.
        </p>
        <p>— Viplora Tech</p>
      </div>
    </body>
  </html>
  `;

  return sendEmail(to, "Your OTP Code", html);
};

// ----------------------------
// 4. Welcome Email
// ----------------------------
export const sendWelcomeEmail = async (to, name, role) => {
  const roleLabel =
    role === "superadmin"
      ? "Super Administrator"
      : role === "admin"
      ? "Administrator"
      : "User";

  const html = `
  <h2>Welcome to Viplora Tech 🎉</h2>
  <p>Hi <b>${name}</b>,</p>
  <p>Your account has been created with role: <b>${roleLabel}</b></p>
  <p>We’re excited to have you on board.</p>
  <p>— Team Viplora Tech</p>
  `;

  return sendEmail(to, "Welcome to Viplora Tech", html);
};

// ----------------------------
// 5. Reset Password Email
// ----------------------------
export const sendResetPasswordEmail = async (to, resetLink) => {
  const html = `
    <h2>Password Reset Requested</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `;
  return sendEmail(to, "Reset Your Password", html);
};

// ----------------------------
// 6. Password Changed Alert
// ----------------------------
export const sendPasswordChangedEmail = async (to) => {
  const html = `
  <h2>Password Changed Successfully</h2>
  <p>Your account password has been updated.</p>
  <p>If this was not you, contact support immediately.</p>
  `;
  return sendEmail(to, "Security Alert: Password Changed", html);
};

export default transporter;
