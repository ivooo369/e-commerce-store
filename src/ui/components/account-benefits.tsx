import { FiCheck } from "react-icons/fi";

export default function AccountBenefits() {
  return (
    <div className="text-text-secondary">
      <h3 className="font-semibold text-lg sm:text-xl text-center mb-3 text-text-primary">
        Когато сте влезли в своя акаунт, имате възможност:
      </h3>
      <ul className="space-y-2 text-base sm:text-lg m-auto w-2/4">
        <li className="flex items-center gap-4">
          <FiCheck className="text-success-color flex-shrink-0" size={35} />
          <span className="leading-6">
            Да преглеждате историята на всички поръчки, които сте направили
          </span>
        </li>
        <li className="flex items-center gap-4">
          <FiCheck className="text-success-color flex-shrink-0" size={35} />
          <span className="leading-6">
            Да се възползвате от специални промоции
          </span>
        </li>
        <li className="flex items-center gap-4">
          <FiCheck className="text-success-color flex-shrink-0" size={35} />
          <span className="leading-6">
            Да запазвате продукти, които са Ви харесали в &quot;Любими&quot;
          </span>
        </li>
      </ul>
    </div>
  );
}
