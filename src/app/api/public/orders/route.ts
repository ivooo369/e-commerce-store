import { NextResponse } from "next/server";
import { Order, PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { getDeliveryMethod, calculateShippingCost } from "@/lib/delivery";
import { OrderItem } from "@/lib/interfaces";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Не сте влезли в акаунта си!" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      userId = payload.userId;
    } catch {
      return NextResponse.json(
        { message: "Невалиден токен!" },
        { status: 401 }
      );
    }

    const orders = await prisma.$queryRaw<Order[]>`
      SELECT 
        id,
        created_at as "createdAt",
        status,
        items,
        address
      FROM orders
      WHERE customer_id = ${userId}
      ORDER BY created_at DESC
    `;

    const processedOrders = orders.map((order: Order) => {
      const items = order.items as unknown as OrderItem[] | null;
      const productsTotal =
        items?.reduce((sum, item) => {
          const price = typeof item.price === "number" ? item.price : 0;
          const quantity =
            typeof item.quantity === "number" ? item.quantity : 1;
          return sum + price * quantity;
        }, 0) || 0;

      const deliveryMethod = getDeliveryMethod(order.address || "");
      const shippingCost = calculateShippingCost(deliveryMethod);
      const total = productsTotal + shippingCost;

      const createdAt = order.createdAt
        ? new Date(order.createdAt).toISOString()
        : new Date().toISOString();

      return {
        ...order,
        items: items || [],
        productsTotal,
        shippingCost,
        total,
        createdAt,
      };
    });

    return NextResponse.json(processedOrders);
  } catch (error) {
    console.error("Възникна грешка при зареждане на поръчките:", error);
    return NextResponse.json(
      { message: "Възникна грешка при зареждане на поръчките!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      city,
      address,
      phone,
      additionalInfo,
      items,
      customerId,
    } = body;

    if (
      !name ||
      !email ||
      !city ||
      !address ||
      !phone ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { message: "Моля, попълнете всички задължителни полета!" },
        { status: 400 }
      );
    }

    const productsTotal = items.reduce((sum: number, item: OrderItem) => {
      const price =
        typeof item.price !== "undefined"
          ? typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0
          : typeof item.product.price === "number"
          ? item.product.price
          : parseFloat(item.product.price) || 0;
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseInt(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    const deliveryMethod = getDeliveryMethod(address);
    const shippingCost = calculateShippingCost(deliveryMethod);
    const orderTotal = productsTotal + shippingCost;

    const orderItems = items.map((item) => {
      const price =
        typeof item.price !== "undefined"
          ? typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0
          : typeof item.product.price === "number"
          ? item.product.price
          : parseFloat(item.product.price) || 0;

      return {
        product: {
          id: item.product.id,
          name: item.product.name,
          price: price,
          code: item.product.code || "",
          images: Array.isArray(item.product.images) ? item.product.images : [],
        },
        quantity:
          typeof item.quantity === "number"
            ? item.quantity
            : parseInt(item.quantity) || 1,
        price: price,
      };
    });

    const formattedAddress =
      deliveryMethod === "ADDRESS" ? `До адрес: ${address}` : address;

    const [order] = (await prisma.$queryRaw`
      INSERT INTO "public"."orders" (
        "id",
        "name",
        "email",
        "city",
        "address",
        "phone",
        "additional_info",
        "items",
        "status",
        "customer_id",
        "created_at",
        "updated_at"
      ) VALUES (
        gen_random_uuid(),
        ${name},
        ${email},
        ${city},
        ${formattedAddress},
        ${phone},
        ${additionalInfo || null},
        ${JSON.stringify(orderItems)}::jsonb,
        'pending',
        ${customerId || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `) as OrderItem[];

    const itemsHtml = items
      .map((item, index) => {
        const isLast = index === items.length - 1;
        const hasImage = item.product.images && item.product.images.length > 0;
        const imageUrl = hasImage
          ? item.product.images[0]
          : "/images/placeholder-product.jpg";

        return `
        <div style="${
          !isLast
            ? "padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;"
            : ""
        } margin-bottom: 15px;">
          <div style="display: flex; gap: 15px;">
            <div style="width: 80px; height: 80px; flex-shrink: 0; margin-right: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
              <img 
                src="${imageUrl}" 
                alt="${item.product.name}" 
                style="width: 100%; height: 100%; object-fit: contain; padding: 4px;"
                onerror="this.onerror=null; this.src='/images/placeholder-product.jpg'"
              />
            </div>
            <div style="flex: 1; min-width: 0;">
              <h3 style="margin: 0 0 5px 0; font-size: 15px; color: #1f2937; font-weight: 500; word-wrap: break-word;">
                ${item.product.name}
              </h3>
              <p style="margin: 3px 0; font-size: 13px; color: #4b5563;">
                Код: ${item.product.code}
              </p>
              <p style="margin: 3px 0; font-size: 13px; color: #4b5563;">
                Количество: ${item.quantity} бр.
              </p>
              <p style="margin: 3px 0; font-size: 14px; color: #1f2937; font-weight: 500;">
                ${(item.product.price * item.quantity).toFixed(2)} лв.
                <span style="font-size: 12px; color: #6b7280; font-weight: normal; margin-left: 5px;">
                  (${item.product.price.toFixed(2)} лв. × ${item.quantity} бр.)
                </span>
              </p>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    const orderId = order.id as string;

    const emailPromises = [];

    // Email to admin
    emailPromises.push(
      transporter.sendMail({
        from: `"LIPCI Design Studio" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `Нова поръчка #${orderId.substring(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
            <header style="background-color: #1E3A8A; color: #ffffff; padding: 1rem; text-align: center;">
              <h1 style="margin: 0; font-size: 1.5rem;">Нова поръчка #${orderId.substring(
                0,
                8
              )}</h1>
            </header>
            
            <div style="padding: 1.5rem; background-color: #f8fafc;">
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h2 style="color: #1f2937; font-size: 1.1rem; margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem;">Информация за поръчката</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                  <div>
                    <h3 style="font-size: 0.9rem; color: #6b7280; margin: 0 0 0.5rem 0;">Данни за доставка</h3>
                    <p style="margin: 0.25rem 0;"><strong>Име:</strong> ${name}</p>
                    <p style="margin: 0.25rem 0;"><strong>Телефон:</strong> ${phone}</p>
                    <p style="margin: 0.25rem 0;"><strong>${
                      address.startsWith("До офис:") ? "Офис:" : "Адрес:"
                    }</strong> ${city}, ${address}</p>
                    ${
                      additionalInfo
                        ? `<p style="margin: 0.25rem 0;"><strong>Допълнителна информация:</strong> ${additionalInfo}</p>`
                        : ""
                    }
                  </div>
                  <div style="height: 1px; background-color: #e5e7eb; margin: 0 0 1.5rem 0;"></div>
                  <div>
                    <h3 style="font-size: 0.9rem; color: #6b7280; margin: 0 0 0.5rem 0;">Данни за поръчката</h3>
                    <p style="margin: 0.25rem 0;"><strong>Номер на поръчка:</strong> #${orderId.substring(
                      0,
                      8
                    )}</p>
                    <p style="margin: 0.25rem 0;"><strong>Дата на поръчка:</strong> ${new Date().toLocaleString(
                      "bg-BG",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )} ч.</p>
                    <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${email}</p>
                  </div>
                </div>

                <h2 style="color: #1f2937; font-size: 1.1rem; margin: 1.5rem 0 0.5rem 0; padding-bottom: 0.5rem;">Поръчани продукти</h2>
                ${itemsHtml}
                
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: right;">
                  <div style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 1rem;">Стойност на продуктите:</span>
                    <span>${(orderTotal - shippingCost).toFixed(2)} лв.</span>
                  </div>
                  <div style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 1rem;">Цена на доставка:</span>
                    <span>${shippingCost.toFixed(2)} лв.</span>
                  </div>
                  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                    <span style="font-weight: 600; margin-right: 1rem;">Обща сума:</span>
                    <span style="font-size: 1.1rem; font-weight: 600; color: #1f2937;">${orderTotal.toFixed(
                      2
                    )} лв.</span>
                  </div>
                </div>
              </div>

            <footer style="background-color: #f3f4f6; color: #6b7280; padding: 1rem; font-size: 0.85rem; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0.25rem 0;">© LIPCI Design Studio. Всички права запазени.</p>
              <p style="margin: 0.25rem 0; font-size: 0.8rem;">Това е автоматично генерирано съобщение. Моля, не отговаряйте на този имейл!</p>
            </footer>
          </div>
        `,
      })
    );

    // Email to customer
    emailPromises.push(
      transporter.sendMail({
        from: `"LIPCI Design Studio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Потвърждение на поръчка #${orderId
          .substring(0, 8)
          .toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
            <header style="background-color: #0a5c3a; color: #ffffff; padding: 1rem; text-align: center;">
              <h1 style="margin: 0; font-size: 1.5rem;">Благодарим за вашата поръчка!</h1>
              <p style="margin: 0.5rem 0 0; font-size: 1.1rem;">Номер на поръчка: #${orderId.substring(
                0,
                8
              )}</p>
            </header>
            
            <div style="padding: 1.5rem; background-color: #f8fafc;">
              <p style="margin: 0 0 1rem 0;">Здравейте, ${name},</p>
              <p style="margin: 0 0 1rem 0;">Благодарим ви, че пазарувахте при нас! Моля, потвърдете поръчката си, за да започнем обработката!</p>
              
              <div style="width: 100%; text-align: center; margin: 2rem 0;">
                <div style="display: inline-flex; margin: 0 auto 1rem auto;">
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/orders/confirm?orderId=${orderId}" 
                     style="display: inline-block; background-color: #0a5c3a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500; font-size: 1rem; white-space: nowrap; margin-right: 2rem;">
                    Потвърди поръчката
                  </a>
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/orders/cancel?orderId=${orderId}" 
                     style="display: inline-block; background-color: #d32f2f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500; font-size: 1rem; white-space: nowrap;">
                    Откажи поръчката
                  </a>
                </div>
                <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0;">
                  Моля, изберете дали искате да потвърдите или откажете поръчката си!
                </p>
              </div>
              
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h2 style="color: #1f2937; font-size: 1.1rem; margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem;">Информация за поръчката</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                  <div>
                    <h3 style="font-size: 0.9rem; color: #6b7280; margin: 0 0 0.5rem 0;">Данни за доставка</h3>
                    <p style="margin: 0.25rem 0;"><strong>Име:</strong> ${name}</p>
                    <p style="margin: 0.25rem 0;"><strong>Телефон:</strong> ${phone}</p>
                    <p style="margin: 0.25rem 0;"><strong>${
                      address.startsWith("До офис:") ? "Офис:" : "Адрес:"
                    }</strong> ${city}, ${address}</p>
                    ${
                      additionalInfo
                        ? `<p style="margin: 0.25rem 0;"><strong>Допълнителна информация:</strong> ${additionalInfo}</p>`
                        : ""
                    }
                  </div>
                  <div style="height: 1px; background-color: #e5e7eb; margin: 0 0 1.5rem 0;"></div>
                  <div>
                    <h3 style="font-size: 0.9rem; color: #6b7280; margin: 0 0 0.5rem 0;">Данни за поръчката</h3>
                    <p style="margin: 0.25rem 0;"><strong>Номер на поръчка: </strong> #${orderId.substring(
                      0,
                      8
                    )}</p>
                    <p style="margin: 0.25rem 0;"><strong>Дата на поръчка: </strong>${new Date().toLocaleString(
                      "bg-BG",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )} ч.</p>
                  </div>
                </div>

                <h2 style="color: #1f2937; font-size: 1.1rem; margin: 1.5rem 0 0.5rem 0; padding-bottom: 0.5rem;">Вашите продукти</h2>
                ${itemsHtml}
                
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: right;">
                  <div style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 1rem;">Стойност на продуктите:</span>
                    <span>${(orderTotal - shippingCost).toFixed(2)} лв.</span>
                  </div>
                  <div style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 1rem;">Цена на доставка:</span>
                    <span>${shippingCost.toFixed(2)} лв.</span>
                  </div>
                  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                    <span style="font-weight: 600; margin-right: 1rem;">Обща сума:</span>
                    <span style="font-size: 1.1rem; font-weight: 600; color: #1f2937;">${orderTotal.toFixed(
                      2
                    )} лв.</span>
                  </div>
                </div>
              </div>
    
              <p>Ако имате въпроси относно вашата поръчка, моля, свържете се с нас на ${
                process.env.EMAIL_USER
              } или ни се обадете на телефонен номер: +359 88 911 5233.</p>
            </div>
            
            <footer style="background-color: #f3f4f6; color: #6b7280; padding: 1rem; font-size: 0.85rem; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0.25rem 0;">© LIPCI Design Studio. Всички права запазени.</p>
              <p style="margin: 0.25rem 0; font-size: 0.8rem;">Това е автоматично генерирано съобщение. Моля, не отговаряйте на този имейл!</p>
            </footer>
          </div>
        `,
      })
    );

    await Promise.all(emailPromises);

    return NextResponse.json(
      {
        message: "Поръчката ви е приета успешно!",
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Възникна грешка при създаване на поръчка:", error);
    return NextResponse.json(
      {
        message:
          "Възникна грешка при обработка на поръчката Ви. Моля, опитайте отново по-късно!",
      },
      { status: 500 }
    );
  }
}
