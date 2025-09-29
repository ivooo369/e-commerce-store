import { getVerificationLink } from "@/services/userService";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = getVerificationLink(token);
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Потвърждение на имейл адрес",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
        <header style="background-color: #1E3A8A; color: #ffffff; padding: 0.6rem; text-align: center;">
          <h2 class="header-text" style="margin: 0; font-size: 1.5rem;">
            Потвърдете Вашия имейл адрес
          </h2>
        </header>
        <div class="content" style="font-size: 1.2rem; font-weight: bold; text-align: center; padding: 1rem 1.5rem 1rem 1.5rem; background-color: #f8fafc;">
          <p style="color: #4b5563; margin-bottom: 1rem;">
            Моля, потвърдете имейла си, като натиснете следния линк:
          </p>
          <p style="text-align: center;">
            <a href="${verificationLink}" style="background-color: #1E3A8A; color: #ffffff; padding: 0.8rem 2rem; text-decoration: none; font-size: 1.1rem; border-radius: 5px; display: inline-block;">
              Потвърдете имейла
            </a>
          </p>
          <p style="color: #4b5563; margin-top: 1rem;">
            Линкът ще бъде валиден за 1 час. Ако не сте поискали потвърждението, моля, игнорирайте това съобщение.
          </p>
        </div>
        <footer style="background-color: #1E3A8A; color: #ffffff; padding: 0.5rem; font-size: 0.9rem; text-align: center;">
          <p class="footer-text" style="margin: 0;">
            Това съобщение е изпратено автоматично. Моля, не отговаряйте на него.
          </p>
        </footer>
      </div>
    `,
  });
};
