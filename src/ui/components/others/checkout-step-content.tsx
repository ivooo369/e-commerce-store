import { AlertCircle, Check, Phone, Truck } from "lucide-react";
import { FormControl, FormControlLabel, FormHelperText } from "@mui/material";
import MuiCheckbox from "@mui/material/Checkbox";
import SettlementInput from "@/ui/components/search/settlement-input";
import { CheckoutStepsProps } from "@/lib/types/interfaces";
import { deliveryOptions } from "@/lib/utils/delivery";
import { MemoizedOfficeMap } from "../maps/memorized-office-map";

export default function CheckoutSteps({
  currentStep,
  formData,
  formErrors,
  offices,
  isLoadingOffices,
  officesError,
  onInputChange,
  onDeliveryMethodChange,
  onFormDataChange,
  onSettlementSelect,
}: CheckoutStepsProps) {
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Данни за контакт
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Име <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Имейл адрес <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Населено място <span className="text-red-500">*</span>
              </label>
              <SettlementInput
                value={formData.city}
                onChange={(value) =>
                  onFormDataChange((prev) => ({ ...prev, city: value }))
                }
                onSelect={onSettlementSelect}
                required
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Изберете начин на доставка
            </h3>

            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              {deliveryOptions.map((option) => {
                const isSelected = formData.deliveryMethod === option.id;
                const colorClass = isSelected
                  ? `border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md`
                  : `border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500`;

                return (
                  <div
                    key={option.id}
                    className={`border-2 rounded-lg p-2 sm:rounded-xl sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${colorClass}`}
                    onClick={() => onDeliveryMethodChange(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div
                          className={`p-1.5 rounded-full flex-shrink-0 ${
                            isSelected
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {option.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            <span className="hidden sm:inline">
                              {option.title}
                            </span>
                            <span className="sm:hidden">
                              {option.shortTitle || option.title}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {option.price}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {formData.deliveryMethod === "address" ? (
              <div className="mt-6">
                <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Пълен адрес за доставка{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={onInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Офиси в/във{" "}
                  {formData.city
                    ? formData.city.split("(")[0].trim()
                    : "населеното място"}
                </h4>

                {isLoadingOffices ? (
                  <div className="flex items-center justify-center py-8 space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Зареждане на офисите...</p>
                  </div>
                ) : officesError ? (
                  <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 dark:text-red-200">
                        Възникна грешка при зареждането на офисите. Моля,
                        опитайте отново по-късно.
                      </p>
                    </div>
                  </div>
                ) : offices.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Изберете офис:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {offices.map((office) => (
                          <div key={office.id}>
                            <div
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                formData.officeId === office.id
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-800"
                                  : "border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-400"
                              }`}
                              onClick={() =>
                                onFormDataChange((prev) => ({
                                  ...prev,
                                  officeId: office.id,
                                }))
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {office.name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {office.address.full ||
                                      `${office.address.street} ${office.address.number}`.trim()}
                                  </div>
                                </div>
                                {formData.officeId === office.id && (
                                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                )}
                              </div>

                              {(office.phones?.length > 0 ||
                                office.isMachine ||
                                (office.weeklySchedule &&
                                  office.weeklySchedule.length > 0)) && (
                                <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                                  {office.weeklySchedule &&
                                    office.weeklySchedule.length > 0 && (
                                      <div>
                                        <div className="text-base text-gray-500 dark:text-gray-400 font-medium mb-1">
                                          Работно време по дни:
                                        </div>
                                        <table className="w-full text-sm text-left mb-2">
                                          <tbody>
                                            {office.weeklySchedule?.map((d) => (
                                              <tr key={d.day}>
                                                <td className="pr-2 py-0.5 whitespace-nowrap">
                                                  {d.day}:
                                                </td>
                                                <td className="py-0.5">
                                                  {d.time
                                                    ? d.time
                                                    : "Почивен ден"}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  {office.phones &&
                                    office.phones.length > 0 &&
                                    office.phones[0] && (
                                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                                        <span>{office.phones[0]}</span>
                                      </div>
                                    )}
                                  {office.isMachine ||
                                    (office.name.includes("Еконтомат") && (
                                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        Автоматична станция
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h4 className="font-medium mb-2">
                          Разположение на офисите:
                        </h4>
                        <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <MemoizedOfficeMap
                            key={`${formData.city}-${offices.length}`}
                            cityName={formData.city.split(",")[0]}
                            offices={offices}
                            selectedOfficeId={formData.officeId}
                            onOfficeSelect={(officeId) => {
                              onFormDataChange((prev) => ({
                                ...prev,
                                officeId,
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.city ? (
                  <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-yellow-700 dark:text-yellow-200">
                        Няма налични офиси за &quot;
                        {formData.city
                          ? formData.city.split("(")[0].trim()
                          : ""}
                        &quot;.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-300 mr-2" />
                      <p className="text-blue-700 dark:text-blue-200">
                        Въведете населено място, за да видите наличните офиси
                      </p>
                    </div>
                  </div>
                )}

                {formData.deliveryMethod === "speedy" && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-md font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Не намирате желания офис на Спиди?
                    </h3>
                    <div className="text-blue-700 dark:text-blue-200 text-sm">
                      <p>
                        Ако не намирате желания офис на Спиди в списъка с
                        резултати, моля посочете го в полето &quot;Бележки към
                        поръчката&quot;, и ние ще се погрижим поръчката Ви да
                        бъде доставена до посочения офис.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                Бележки към поръчката
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={onInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-6 border border-transparent dark:border-gray-700 break-words overflow-hidden">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Данни за доставка
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Име:
                  </span>
                  <span className="ml-2 dark:text-gray-200">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Имейл:
                  </span>
                  <span className="ml-2 dark:text-gray-200">
                    {formData.email}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Телефон:
                  </span>
                  <span className="ml-2 dark:text-gray-200">
                    {formData.phone}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Населено място:
                  </span>
                  <span className="ml-2 dark:text-gray-200">
                    {formData.city}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Доставка:
                  </span>
                  <span className="ml-2 dark:text-gray-200">
                    {
                      deliveryOptions.find(
                        (opt) => opt.id === formData.deliveryMethod
                      )?.title
                    }
                  </span>
                </div>

                {formData.deliveryMethod === "address" ? (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Адрес:
                    </span>
                    <span className="ml-2 dark:text-gray-200">
                      {formData.address}
                    </span>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Офис:
                    </span>
                    <span className="ml-2 dark:text-gray-200">
                      {(() => {
                        const office = offices.find(
                          (o) => o.id === formData.officeId
                        );
                        const address =
                          office?.address?.full ||
                          [office?.address?.street, office?.address?.number]
                            .filter(Boolean)
                            .join(" ");
                        return `${office?.name || formData.officeId}${
                          address ? ", " + address : ""
                        }`;
                      })()}
                    </span>
                  </div>
                )}

                {formData.notes && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Бележки:
                    </span>
                    <span className="ml-2 dark:text-gray-200">
                      {formData.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Начин на плащане
              </h4>

              <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700/60">
                <div className="flex items-center space-x-3">
                  <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      Наложен платеж
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Плащане в брой при получаване на пратката
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-center">
                <FormControl
                  component="fieldset"
                  error={!formData.agreeTerms && !!formErrors?.agreeTerms}
                  className="w-full max-w-2xl"
                >
                  <FormControlLabel
                    className="m-0"
                    control={
                      <MuiCheckbox
                        name="agreeTerms"
                        checked={formData.agreeTerms || false}
                        onChange={onInputChange}
                        color="primary"
                        required
                        size="medium"
                        inputProps={{
                          "aria-label": "Съгласие с условията",
                        }}
                      />
                    }
                    label={
                      <span className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                        Съгласявам се с{" "}
                        <a
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Общите условия
                        </a>{" "}
                        и{" "}
                        <a
                          href="/privacy"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Политиката за поверителност
                        </a>
                      </span>
                    }
                  />
                  {!formData.agreeTerms && formErrors?.agreeTerms && (
                    <FormHelperText className="text-red-600 dark:text-red-400 ml-8 mt-1 text-sm">
                      {formErrors.agreeTerms}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderStepContent()}</>;
}
