import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email transporter error:", error);
  } else {
    console.log("Email server is ready to take messages");
    console.log("Sender:", process.env.SMTP_FROM);
  }
});

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("🔐 Initiating OTP email delivery sequence...");
    console.log("📧 SMTP Configuration Verified");
    console.log("FROM:", process.env.SMTP_FROM);
    console.log("TO:", email);

    const mailOptions = {
      from: `UrbanNest Security <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Your UrbanNest Verification Code - Secure Access Required",
      html: `
       <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Verify Your UrbanNest Account</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f8fa;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 48px 48px 32px 48px; text-align: center; border-bottom: 1px solid #e8ebed;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #5b7cff 0%, #4a63d9 100%); border-radius: 12px; margin: 0 auto 24px; display: inline-flex; align-items: center; justify-content: center;">
                                <span style="font-size: 24px; line-height: 1;">🏠</span>
                            </div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0f172a; letter-spacing: -0.02em;">UrbanNest</h1>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 48px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #0f172a; line-height: 1.3;">Verify your account</h2>
                            <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569;">To continue, please enter this verification code when prompted:</p>
                            
                            <!-- OTP Code -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 32px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
                                        <div style="font-size: 14px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Verification Code</div>
                                        <div style="font-size: 40px; font-weight: 700; color: #0f172a; letter-spacing: 0.25em; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;">${otp}</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                                <tr>
                                    <td style="padding: 20px 24px; background-color: #f0f9ff; border-left: 3px solid #3b82f6; border-radius: 6px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e40af;">
                                            <strong style="font-weight: 600;">This code expires in 10 minutes.</strong><br>
                                            For your security, never share this code with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                                <tr>
                                    <td style="border-top: 1px solid #e8ebed;"></td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                                If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 48px; background-color: #f8fafc; border-top: 1px solid #e8ebed; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                                Questions? Contact us at <a href="mailto:support@urbannest.com" style="color: #5b7cff; text-decoration: none;">support@urbannest.com</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                                © ${new Date().getFullYear()} UrbanNest Technologies, Inc. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer Links -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 24px auto 0;">
                    <tr>
                        <td style="text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                <a href="#" style="color: #64748b; text-decoration: none; margin: 0 8px;">Privacy Policy</a> •
                                <a href="#" style="color: #64748b; text-decoration: none; margin: 0 8px;">Terms of Service</a> •
                                <a href="#" style="color: #64748b; text-decoration: none; margin: 0 8px;">Help Center</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

      `,
    };

    const result = await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Error sending email:", error);

    if (error.code === "EAUTH") {
      console.error("Authentication failed. Please check:");
      console.error("   - Email address:", process.env.SMTP_USER);
      console.error("   - App password (16 characters)");
      console.error("   - 2-factor authentication is enabled");
      console.error('   - App password is generated for "Mail"');
    } else if (error.code === "ECONNECTION") {
      console.error("Connection failed. Check your internet connection.");
    }

    return false;
  }
};
export const sendAllotmentEmail = async ({
  email,
  fullName,
  flatNo,
  block,
  ownerStatus,
  passkey,
}) => {
  try {
    const mailOptions = {
      from: `UrbanNest <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "🏠 House Allotment Confirmation",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>🏠 UrbanNest</h2>
          <h3 style="color:green;">House Allotted Successfully 🎉</h3>

          <p>Hello <b>${fullName}</b>,</p>
          <p>Your house has been successfully allotted.</p>

          <ul>
            <li><b>Flat No:</b> ${flatNo}</li>
            <li><b>Block:</b> ${block}</li>
            <li><b>Status:</b> ${ownerStatus}</li>
            <li><b>Passkey:</b> ${passkey}</li>
          </ul>

          <p>Please keep your passkey safe 🔐</p>

          <br/>
          <p>Regards,<br/>UrbanNest Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Allotment email sent");
    return true;

  } catch (error) {
    console.error("❌ Allotment email error:", error);
    return false;
  }
};

export default transporter;
