import nodemailer from "nodemailer";

const getBaseUrl = () => {
  return (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
};

const getVerificationLink = (token: string) => {
  return `${getBaseUrl()}/user/verify-email?token=${token}`;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderStatusNotification = async (
  orderId: string,
  status: "confirmed" | "cancelled",
  customerName: string,
  customerEmail: string
) => {
  const statusText = status === "confirmed" ? "потвърдена" : "отказана";
  const statusColor = status === "confirmed" ? "#0a5c3a;" : "#d32f2f;";
  const statusIcon = status === "confirmed" ? "✓" : "✗";

  try {
    await transporter.sendMail({
      from: `"LIPCI Design Studio" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Поръчка #${orderId
        .substring(0, 8)
        .toUpperCase()} е ${statusText}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; overflow: hidden;">
          <header style="background-color: ${statusColor}; color: #ffffff; padding: 1rem; text-align: center;">
            <h1 style="margin: 0; font-size: 1.5rem;">Поръчка #${orderId.substring(
              0,
              8
            )} е ${statusText.toUpperCase()}</h1>
          </header>
          
          <div style="padding: 1.5rem; background-color: #f8fafc;">
            <div style="text-align: center; margin: 1rem 0 2rem 0;">
              <div style="display: inline-block; width: 60px; height: 60px; border-radius: 50%; background-color: ${statusColor}20; margin-bottom: 1rem; line-height: 60px; text-align: center;">
                <span style="font-size: 2rem; color: ${statusColor}; display: inline-block; vertical-align: middle; line-height: normal;">${statusIcon}</span>
              </div>
              <p style="font-size: 1.1rem; color: #4b5563; margin: 0.5rem 0 0 0;">
                Поръчка <strong>#${orderId.substring(
                  0,
                  8
                )}</strong> беше ${statusText} от клиента.
              </p>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
              <h2 style="color: #1f2937; font-size: 1.1rem; margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                Информация за поръчката
              </h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <p style="margin: 0.5rem 0;"><strong>Номер на поръчка:</strong> #${orderId.substring(
                    0,
                    8
                  )}</p>
                  <p style="margin: 0.5rem 0;"><strong>Статус:</strong> 
                    <span style="color: ${statusColor}; font-weight: 500;">${statusText.toUpperCase()}</span>
                  </p>
                </div>
                <div>
                  <p style="margin: 0.5rem 0;"><strong>Клиент:</strong> ${customerName}</p>
                  <p style="margin: 0.5rem 0;"><strong>Имейл:</strong> ${customerEmail}</p>
                </div>
              </div>
            </div>
            
            <footer style="background-color: #f3f4f6; color: #6b7280; padding: 1rem; font-size: 0.85rem; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0.25rem 0;">© LIPCI Design Studio. Всички права запазени.</p>
              <p style="margin: 0.25rem 0; font-size: 0.8rem;">Това е автоматично генерирано съобщение. Моля, не отговаряйте на този имейл!</p>
            </footer>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order status notification:", error);
  }
};

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
