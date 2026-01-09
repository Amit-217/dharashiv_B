import nodemailer from "nodemailer";

/* ================= TRANSPORT ================= */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,           // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT),   // 587
  secure: false,                          // TLS (587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// (optional but good) – startup check
transporter.verify((err) => {
  if (err) {
    console.error("❌ Email transporter error:", err.message);
  } else {
    console.log("📧 Email transporter ready");
  }
});

/* ================= BASE WRAPPER ================= */
const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    
    <div style="background:#0f172a;color:#ffffff;padding:16px 24px;">
      <h2 style="margin:0;">Viplora Tech</h2>
    </div>

    <div style="padding:24px;color:#111827;font-size:15px;line-height:1.6;">
      ${content}
    </div>

    <div style="background:#f1f5f9;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
      © ${new Date().getFullYear()} Viplora Tech. All rights reserved.
    </div>

  </div>
</body>
</html>
`;

/* ================= SEND EMAIL ================= */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // "Viplora Tech <cinpedoff@gmail.com>"
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};

/* ================= OTP EMAIL ================= */
export const sendOtpEmail = async (to, otp) => {
  const html = baseTemplate(
    "OTP Verification",
    `
      <h3 style="margin-top:0;">OTP Verification</h3>
      <p>Your One-Time Password (OTP) is:</p>

      <div style="
        font-size:28px;
        font-weight:bold;
        letter-spacing:6px;
        background:#f1f5f9;
        padding:12px;
        text-align:center;
        border-radius:6px;
        margin:16px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for <b>10 minutes</b>.</p>
      <p style="color:#dc2626;font-size:13px;">
        ⚠️ Do not share this OTP with anyone.
      </p>
    `
  );

  return sendEmail({
    to,
    subject: "Your OTP Code",
    html
  });
};

/* ================= WELCOME EMAIL ================= */
export const sendWelcomeEmail = async (to, name, role) => {
  const roleLabel =
    role === "superadmin"
      ? "Super Administrator"
      : role === "admin"
      ? "Administrator"
      : "User";

  const html = baseTemplate(
    "Welcome",
    `
      <h3>Welcome to Viplora Tech 🎉</h3>
      <p>Hello <b>${name}</b>,</p>
      <p>Your account has been successfully created.</p>

      <p><b>Role:</b> ${roleLabel}</p>

      <p>You can now log in and start using the system.</p>
    `
  );

  return sendEmail({
    to,
    subject: "Welcome to Viplora Tech",
    html
  });
};

/* ================= PASSWORD CHANGED ================= */
export const sendPasswordChangedEmail = async (to) => {
  const html = baseTemplate(
    "Password Changed",
    `
      <h3>Password Updated</h3>
      <p>Your account password has been changed successfully.</p>

      <p style="color:#dc2626;">
        If this was not you, please contact support immediately.
      </p>
    `
  );

  return sendEmail({
    to,
    subject: "Security Alert: Password Changed",
    html
  });
};

export default transporter;
