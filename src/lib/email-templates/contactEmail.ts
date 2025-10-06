import { ContactEmailData } from "@/lib/types/interfaces";

export function contactEmailHtml({
  name,
  email,
  title,
  content,
}: ContactEmailData) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
      <header style="background-color: #1E3A8A; color: #ffffff; padding: 0.6rem; text-align: center;">
        <h1 style="margin: 0; font-size: 1.2rem;">
          Ново съобщение от контактната форма
        </h1>
      </header>
      <div style="font-size: 1rem; padding: 1rem 1.5rem; background-color: #f8fafc;">
        <section style="margin-bottom: 1rem;">
          <strong style="margin-right: 5px; color: #1f2937;">Име:</strong>
          <span style="color: #4b5563; display: block;">${name}</span>
        </section>
        <section style="margin-bottom: 1rem;">
          <strong style="margin-right: 5px; color: #1f2937;">Email:</strong>
          <span style="color: #4b5563; display: block;">${email}</span>
        </section>
        <section style="margin-bottom: 1rem;">
          <strong style="margin-right: 5px; color: #1f2937;">Тема:</strong>
          <span style="color: #4b5563; display: block;">${title}</span>
        </section>
        <section>
          <strong style="margin-right: 5px; color: #1f2937;">Съобщение:</strong>
          <span style="color: #4b5563; display: block;">${content}</span>
        </section>
      </div>
      <footer style="background-color: #1E3A8A; color: #ffffff; padding: 0.5rem; font-size: 0.9rem; text-align: center;">
        <p style="margin: 0;">
          Това съобщение е изпратено чрез контактната форма на сайта.
        </p>
      </footer>
    </div>
  `;
}
