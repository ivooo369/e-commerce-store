import { emailTransporter } from "@/lib/config/email.config";

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetUrl: string
) => {
  return emailTransporter.sendMail({
    from: `"Lipci Design Studio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Смяна на парола - Lipci Design Studio",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
        <header style="background-color: #1E3A8A; color: #ffffff; padding: 0.6rem; text-align: center;">
          <h2 class="header-text" style="margin: 0; font-size: 1.5rem;">
            Смяна на парола
          </h2>
        </header>
        <div class="content" style="font-size: 1.1rem; padding: 1.5rem; background-color: #f8fafc;">
          <p style="color: #4b5563; margin-bottom: 1rem;">
            Здравейте${firstName ? ` ${firstName}` : ""},
          </p>
          <p style="color: #4b5563; margin-bottom: 1rem;">
            Получихме заявка за смяна на паролата за вашия акаунт в Lipci Design Studio.
          </p>
          <p style="color: #4b5563; margin-bottom: 1.5rem;">
            Ако сте поискали смяна на паролата, моля натиснете бутона по-долу:
          </p>
          <p style="text-align: center; margin: 2rem 0;">
            <a href="${resetUrl}" style="background-color: #1E3A8A; color: #ffffff; padding: 0.8rem 2rem; text-decoration: none; font-size: 1.1rem; border-radius: 5px; display: inline-block; font-weight: bold;">
              Смени паролата
            </a>
          </p>
          <p style="color: #4b5563; margin-top: 1.5rem; font-size: 0.9rem;">
            <strong>Важно:</strong> Линкът за смяна на паролата е валиден за 1 час. Ако не сте поискали тази промяна, просто игнорирайте този имейл.
          </p>
          <p style="color: #4b5563; margin-top: 1rem; font-size: 0.9rem;">
            Ако не сте направили тази заявка, моля свържете се с нас, за да гарантираме безопасността на акаунта Ви.
          </p>
        </div>
        <footer style="background-color: #1E3A8A; color: #ffffff; padding: 0.5rem; font-size: 0.9rem; text-align: center;">
          <p class="footer-text" style="margin: 0;">
            Това съобщение е изпратено автоматично. Моля, не отговаряйте на него!
          </p>
        </footer>
      </div>
    `,
  });
};
