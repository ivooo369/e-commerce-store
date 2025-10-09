import { OrderEmailData, OrderItem } from "@/lib/types/interfaces";
import { formatPrice } from "@/lib/utils/currency";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateItemsHtml(items: OrderItem[]) {
  return items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const hasImage = item.product.images && item.product.images.length > 0;
      const imageUrl = hasImage
        ? item.product.images[0]
        : "/images/placeholder-product.jpg";
      const quantity = typeof item.quantity === "number" ? item.quantity : 1;
      const price =
        typeof item.price === "number"
          ? item.price
          : typeof item.price === "string"
          ? parseFloat(item.price)
          : 0;
      return `
      <div style="${
        !isLast ? "padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;" : ""
      } margin-bottom: 15px;">
        <div style="display: flex; gap: 15px;">
          <div style="width: 80px; height: 80px; flex-shrink: 0; margin-right: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
            <img src="${imageUrl}" alt="${
        item.product.name
      }" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" onerror="this.onerror=null; this.src='/images/placeholder-product.jpg'"/>
          </div>
          <div style="flex: 1; min-width: 0;">
            <h3 style="margin: 0 0 5px 0; font-size: 15px; color: #1f2937; font-weight: 500; word-wrap: break-word;">
              <strong>${item.product.name}</strong>
            </h3>
            <p style="margin: 3px 0; font-size: 13px; color: #4b5563;">Код: ${
              item.product.code
            }</p>
            <p style="margin: 3px 0; font-size: 13px; color: #4b5563;">Количество: ${quantity} бр.</p>
            <p style="margin: 3px 0; font-size: 14px; color: #1f2937; font-weight: 500;">
              ${(price * quantity).toFixed(2)} лв. / ${formatPrice(
        price * quantity,
        "EUR"
      )}
              <span style="font-size: 12px; color: #6b7280; font-weight: normal; margin-left: 5px;">
                (${price.toFixed(2)} лв. / ${formatPrice(
        price,
        "EUR"
      )} × ${quantity} бр.)
              </span>
            </p>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
}

export function adminOrderEmail(data: OrderEmailData) {
  const itemsHtml = generateItemsHtml(data.items);
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
      <header style="background-color: #1E3A8A; color: #ffffff; padding: 1rem; text-align: center;">
        <h1 style="margin: 0; font-size: 1.5rem;">Нова поръчка #${data.orderId
          .substring(0, 8)
          .toUpperCase()}</h1>
      </header>
      <div style="padding: 1.5rem; background-color: #f8fafc;">
        <p style="font-size: 14px; margin: 0 0 1rem 0;">Получихте нова поръчка от ${
          data.name
        }.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <h2 style="color: #1f2937; font-size: 1.1rem; margin: 0 0 1rem 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">
            Информация за клиента
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Име:</strong> ${
                data.name
              }</p>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Телефон:</strong> ${
                data.phone
              }</p>
            </div>
            <div>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Населено място:</strong> ${
                data.city
              }</p>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Адрес:</strong> ${
                data.address
              }</p>
            </div>
          </div>
          ${
            data.additionalInfo
              ? `<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Допълнителна информация:</strong></p>
                  <p style="margin: 0.25rem 0; font-size: 14px; color: #4b5563;">${data.additionalInfo}</p>
                </div>`
              : ""
          }
        </div>

        <h2 style="color: #1f2937; font-size: 1.1rem; margin: 0 0 1rem 0;">Поръчани продукти</h2>
        ${itemsHtml}
        <div style="text-align: right; margin: 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 18px; font-weight: 600; margin: 0;">
            <span style="color: #4b5563;">Обща сума: </span>
            <span style="color: #1f2937;">${data.orderTotal.toFixed(
              2
            )} лв. / ${formatPrice(data.orderTotal, "EUR")}</span>
          </p>
        </div>
      </div>
      <footer style="background-color: #f3f4f6; color: #6b7280; padding: 1rem; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; margin: 0;">
        <p style="margin: 0.25rem 0;">© Lipci Design Studio. Всички права запазени.</p>
        <p style="margin: 0.25rem 0; font-size: 0.8rem;">Това е автоматично генерирано съобщение. Моля, не отговаряйте на този имейл!</p>
      </footer>
    </div>
  `;
}

export function customerOrderEmail(data: OrderEmailData) {
  const itemsHtml = generateItemsHtml(data.items);
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
      <header style="background-color: #0a5c3a; color: #ffffff; padding: 0.5rem 1rem; text-align: center;">
        <h1 style="margin-bottom: 0;">Благодарим за вашата поръчка!</h1>
        <p style="font-size: 20px; margin-top: 0;">Номер на поръчка: #${data.orderId
          .substring(0, 8)
          .toUpperCase()}</p>
      </header>
      <div style="padding: 1.5rem; background-color: #f8fafc;">
        <p style="font-size: 14px; margin: 0;">Здравейте, ${data.name},</p>
        <p style="font-size: 14px; margin-top: 6px; margin-bottom: 0;">Благодарим Ви, че пазарувахте при нас! Моля, потвърдете поръчката си, за да започнем обработката!</p>
        <div style="text-align:center; margin:2rem 0;">
          <a href="${
            data.confirmUrl
          }" style="display: inline-block; background-color: #0a5c3a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500; font-size: 1rem; white-space: nowrap; width: 100%; max-width: 250px; text-align: center; box-sizing: border-box; mso-padding-alt: 12px 24px;">Потвърди поръчката</a>
          <br/><br/>
          <a href="${
            data.cancelUrl
          }" style="display: inline-block; background-color: #d32f2f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500; font-size: 1rem; white-space: nowrap; width: 100%; max-width: 250px; text-align: center; box-sizing: border-box; mso-padding-alt: 12px 24px;">Откажи поръчката</a>
        </div>
        <h2 style="margin-bottom: 15px;">Вашите продукти</h2>
        ${itemsHtml}
        <div style="text-align: right; margin: 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 18px; font-weight: 600; margin: 0;">
            <span style="color: #4b5563;">Обща сума: </span>
            <span style="color: #1f2937;">${data.orderTotal.toFixed(
              2
            )} лв. / ${formatPrice(data.orderTotal, "EUR")}</span>
          </p>
        </div>
      </div>
        <footer style="background-color: #f3f4f6; color: #6b7280; padding: 1rem; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; margin: 0;">
          <p style="margin: 0.25rem 0;">© Lipci Design Studio. Всички права запазени.</p>
          <p style="margin: 0.25rem 0; font-size: 0.8rem;">Това е автоматично генерирано съобщение. Моля, не отговаряйте на този имейл!</p>
        </footer>
    </div>
  `;
}

export async function sendOrderStatusNotification(
  orderId: string,
  status: "confirmed" | "cancelled",
  customerName: string,
  customerEmail: string
) {
  const statusText = status === "confirmed" ? "потвърдена" : "отказана";
  const statusColor = status === "confirmed" ? "#0a5c3a" : "#d32f2f";
  const statusIcon = status === "confirmed" ? "✓" : "✗";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; overflow: hidden;">
      <header style="background-color: ${statusColor}; color: #ffffff; padding: 1rem; text-align: center;">
        <h1 style="margin: 0; font-size: 1.5rem;">Поръчка #${orderId
          .substring(0, 8)
          .toUpperCase()} е ${statusText.toUpperCase()}</h1>
      </header>
      
      <div style="padding: 1.5rem; background-color: #f8fafc;">
        <div style="text-align: center;">
          <div style="display: inline-block; width: 60px; height: 60px; border-radius: 50%; background-color: ${statusColor}20; line-height: 60px; text-align: center;">
            <span style="font-size: 2rem; color: ${statusColor}; display: inline-block; vertical-align: middle; line-height: normal;">${statusIcon}</span>
          </div>
          <p style="font-size: 1.1rem; color: #4b5563; margin: 1rem auto;">
            Поръчка <strong>#${orderId
              .substring(0, 8)
              .toUpperCase()}</strong> беше ${statusText} от клиента.
          </p>
        </div>
        
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem;">
          <h2 style="color: #1f2937; font-size: 1.1rem; margin: 0 0 1rem 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">
            Информация за поръчката
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Номер на поръчка:</strong> #${orderId
                .substring(0, 8)
                .toUpperCase()}</p>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Статус:</strong> 
                <span style="color: ${statusColor}; font-weight: 500;">${statusText.toUpperCase()}</span>
              </p>
            </div>
            <div>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Клиент:</strong> ${customerName}</p>
              <p style="margin: 0.5rem 0; font-size: 14px;"><strong>Имейл:</strong> ${customerEmail}</p>
            </div>
          </div>
        </div>
      </div>
        <footer style="background-color: #f3f4f6; color: #6b7280; padding: 1rem; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; margin: 0;">
          <p style="margin: 0.25rem 0;">© Lipci Design Studio. Всички права запазени.</p>
          <p style="margin: 0.25rem 0; font-size: 0.8rem;">Това е автоматично генерирано съобщение. Моля, не отговаряйте на този имейл!</p>
        </footer>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Lipci Design Studio" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER!,
      subject: `Поръчка #${orderId
        .substring(0, 8)
        .toUpperCase()} е ${statusText}`,
      html,
    });
  } catch {
    throw new Error(
      "Възникна грешка при изпращане на известие за статус на поръчка"
    );
  }
}
