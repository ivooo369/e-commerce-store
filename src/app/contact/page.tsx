import ContactForm from "../../ui/components/forms/contact-form";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata = generateMetadata("/");

export default function ContactPage() {
  return (
    <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-2 tracking-wide">
        Контактна форма
      </h1>
      <p className="text-base sm:text-lg text-center text-text-secondary mb-4 sm:mb-6">
        Имате въпрос или предложение? Попълнете формата по-долу и ние ще се
        свържем с вас в най-кратък срок.
      </p>
      <ContactForm />
    </div>
  );
}
