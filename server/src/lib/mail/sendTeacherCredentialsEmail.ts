import { createEmailTransporter } from "../../utils/email/transporter";

export const sendTeacherCredentialsEmail = async (
  to: string,
  name: string,
  email: string,
  password: string
) => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: `"Scripture School Admin" ${process.env.SMTP_USER}`,
    to,
    subject: "👨‍🏫 Welcome to Scripture School – Teacher Account",
    html: `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center;">
          <img src="https://img.icons8.com/ios-filled/100/4a90e2/teacher.png" alt="Teacher Icon" style="width: 80px; height: 80px;" />
          <h2 style="color: #004aad;">Welcome to Scripture School, ${name}! 👋</h2>
        </div>

        <p style="font-size: 16px; color: #333;">Your teacher account has been successfully created in the Scripture School portal. Below are your login credentials:</p>

        <div style="background-color: #ffffff; padding: 15px 20px; border-radius: 8px; border: 1px solid #dcdcdc; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>

        <p style="font-size: 15px; color: #555;">Please log in to your account and change your password after your first login to ensure account security.</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FrontEnd_URL}/login" style="background-color: #004aad; color: #fff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">Login to Scripture School</a>
        </div>

        <p style="margin-top: 40px; font-size: 13px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} Scripture School. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
