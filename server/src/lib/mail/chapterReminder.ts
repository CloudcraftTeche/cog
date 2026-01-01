import { createEmailTransporter } from "../../utils/email/transporter";
export const sendChapterReminderEmail = async (
  to: string,
  name: string,
  chapterTitle: string
) => {
  const transporter = createEmailTransporter();
  const mailOptions = {
    from: `"Scripture School Admin" ${process.env.EMAIL_USER}`,
    to,
    subject: `Reminder: Please complete ${chapterTitle || ""}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; background-color: #f8f8f8; padding: 20px;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="margin: 0; font-size: 24px; color: #333333;">Scripture School</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Hi ${name} ,</h2>
            <p style="font-size: 16px; color: #555555; line-height: 1.6;">
              This is a gentle reminder that you haven’t completed the chapter titled <strong> ${chapterTitle} </strong>.
            </p>
            <p style="font-size: 15px; color: #666666; line-height: 1.6;">
              Please log in to the portal and complete the chapter as soon as possible to stay on track with your studies.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${
                process.env.FRONTEND_URL
              }" style="display: inline-block; background-color: #4a90e2; color: #ffffff; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease;">
                Go to Portal
              </a>
            </div>
          </div>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0;">
              © ${new Date().getFullYear()} Scripture School. All rights reserved.
            </p>
            <p style="margin: 5px 0 0;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
