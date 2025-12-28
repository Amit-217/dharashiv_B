import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ----------------------------
// 1. Create Transporter
// ----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail", // or use host, port, secure for custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: Verify mail transporter (Good for debugging)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Server Error:", error);
  } else {
    console.log("✅ Email Server Ready");
  }
});

// ----------------------------
// 2. Basic Email Send Function
// ----------------------------
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.log("❌ Email Sending Error:", err);
  }
};

// ----------------------------
// 3. Pre-Built Functions (Example)
// ----------------------------

// 🔹 Send OTP Email
export const sendOtpEmail = async (to, otp) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>OTP Verification</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .header {
          background: #0f172a;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 24px;
          color: #333333;
          line-height: 1.6;
        }
        .otp-box {
          margin: 20px 0;
          padding: 14px;
          background: #f1f5f9;
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 6px;
          border-radius: 6px;
          color: #0f172a;
        }
        .warning {
          font-size: 13px;
          color: #dc2626;
          margin-top: 16px;
        }
        .footer {
          background: #f1f5f9;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>OTP Verification</h2>
        </div>

        <div class="content">
          <p>Hello,</p>

          <p>
            Use the following One-Time Password (OTP) to complete your
            verification. This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <div class="otp-box">${otp}</div>

          <p>
            If you did not request this OTP, please ignore this email or contact
            our support team immediately.
          </p>

          <p class="warning">
            ⚠️ Do not share this OTP with anyone. Our team will never ask for
            your OTP.
          </p>

          <p style="margin-top: 24px;">
            Regards,<br />
            <strong>Security Team</strong>
          </p>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} Viplora Tech. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;

  return sendEmail(to, "Your OTP Code", html);
};


// 🔹 Send Welcome Email
export const sendWelcomeEmail = async (to, name, role) => {
  const roleLabel =
    role === "superadmin"
      ? "Super Administrator"
      : role === "admin"
      ? "Administrator"
      : "User";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Welcome</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .header {
          background: #0f172a;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 24px;
          color: #333333;
          line-height: 1.6;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 20px;
          font-size: 13px;
          margin: 12px 0;
          font-weight: 600;
        }
        .footer {
          background: #f1f5f9;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to Viplora Tech 🎉</h2>
        </div>

        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>

          <p>
            We’re excited to have you on board. Your account has been
            successfully created with the following role:
          </p>

          <div class="badge">${roleLabel}</div>

          <p>
            With this role, you now have access to the features and tools
            designed specifically for you.
          </p>

          <p>
            If you have any questions or need assistance, feel free to reach
            out to our support team.
          </p>

          <p>
            Welcome once again, and we look forward to working with you!
          </p>

          <p style="margin-top: 24px;">
            Regards,<br />
            <strong>Team Support</strong>
          </p>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} Viplora Tech. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;

  return sendEmail(to, "Welcome to Viplora Tech", html);
};


// 🔹 Send Password Reset Email
export const sendResetPasswordEmail = async (to, resetLink) => {
  const html = `
    <h2>Password Reset Requested</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `;
  return sendEmail(to, "Reset Your Password", html);
};

export const sendPasswordChangedEmail = async (to) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Changed</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .header {
          background: #14532d;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 24px;
          color: #333333;
          line-height: 1.6;
        }
        .alert {
          background: #ecfdf5;
          border-left: 4px solid #22c55e;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning {
          font-size: 13px;
          color: #dc2626;
          margin-top: 16px;
        }
        .footer {
          background: #f1f5f9;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Updated Successfully</h2>
        </div>

        <div class="content">
          <p>Hello,</p>

          <div class="alert">
            Your account password has been successfully changed.
          </div>

          <p>
            If you made this change, no further action is required.
          </p>

          <p class="warning">
            ⚠️ If you did NOT perform this action, please contact our support
            team immediately to secure your account.
          </p>

          <p style="margin-top: 24px;">
            Regards,<br />
            <strong>Security Team</strong>
          </p>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} Viplora Tech. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;

  return sendEmail(to, "Security Alert: Password Changed", html);
};

// Export transporter if needed elsewhere
export default transporter;


