"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Truck,
  Package,
  CreditCard,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
} from "lucide-react";
import { useCart } from "@/lib/useCart";
import SettlementInput from "@/ui/components/settlement-input";
import OfficeMap from "@/ui/components/office-map";
import { getEcontOfficesRest } from "@/services/econtService";
import dynamic from "next/dynamic";
import CircularProgress from "@/ui/components/circular-progress";
import {
  ApiOffice,
  DeliveryOption,
  FormDataDelivery,
  Office,
} from "@/lib/interfaces";

const DynamicOfficeMap = dynamic<React.ComponentProps<typeof OfficeMap>>(
  () => import("@/ui/components/office-map").then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-gray-500">
          Зареждане на картата...
        </div>
      </div>
    ),
  }
);

export default function CheckoutPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const { items, getCartTotal } = useCart();
  const [formData, setFormData] = useState<FormDataDelivery>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryMethod: "address",
    officeId: "",
    city: "",
    region: "",
    municipality: "",
    address: "",
    notes: "",
    agreeTerms: false,
  });

  const fetchOffices = useCallback(
    async (deliveryMethod: string, cityName: string) => {
      if (!cityName) return;

      setIsLoadingOffices(true);
      setOffices([]);
      setFormData((prev) => ({ ...prev, officeId: "" }));

      try {
        if (deliveryMethod === "econt") {
          const econtOffices = await getEcontOfficesRest(cityName);
          const formattedOffices = econtOffices.map(
            (office: ApiOffice): Office => {
              const workTime = office.workTime || "";
              const weeklySchedule = (office.weeklySchedule || []).map(
                (schedule: { day: string; time?: string | null }) => ({
                  day: schedule.day,
                  time: schedule.time || null,
                  isDayOff: !schedule.time,
                })
              );

              const getCityName = (
                city: string | { name: string } | undefined
              ): string => {
                if (!city) return "";
                return typeof city === "string" ? city : city.name || "";
              };

              const safeString = (
                value: string | number | boolean | null | undefined
              ): string => {
                return value != null ? String(value) : "";
              };

              const safePhones = (
                phones: (string | number)[] | undefined
              ): string[] => {
                if (!Array.isArray(phones)) return [];
                return phones.map((phone) => safeString(phone));
              };

              return {
                id: safeString(office.id),
                name: `Еконт офис ${safeString(office.name)}`,
                address: {
                  full: safeString(office.fullAddress || ""),
                  city: getCityName(office.city || office.address?.city),
                  street: safeString(
                    office.street || office.address?.street || ""
                  ),
                  number: safeString(office.num || office.address?.num || ""),
                  quarter: safeString(
                    office.quarter || office.address?.quarter || ""
                  ),
                  other: safeString(
                    office.other || office.address?.other || ""
                  ),
                  workTime: workTime,
                },
                phones: safePhones(office.phones),
                workTime,
                isMachine: Boolean(office.isAPS || office.isMachine),
                latitude:
                  typeof office.latitude === "number"
                    ? office.latitude
                    : office.location?.latitude,
                longitude:
                  typeof office.longitude === "number"
                    ? office.longitude
                    : office.location?.longitude,
                weeklySchedule,
              };
            }
          );
          setOffices(formattedOffices);
        } else if (deliveryMethod === "speedy") {
          const { getSpeedyOfficesRest } = await import(
            "@/services/speedyService"
          );
          const speedyOffices = await getSpeedyOfficesRest(cityName);
          const formattedOffices = speedyOffices.map(
            (office: ApiOffice): Office => {
              const workTime = office.workTime || "";
              const weeklySchedule = (office.weeklySchedule || []).map(
                (schedule: { day: string; time?: string | null }) => ({
                  day: schedule.day,
                  time: schedule.time || null,
                  isDayOff: !schedule.time,
                })
              );

              const getCityName = (
                city: string | { name: string } | undefined
              ): string => {
                if (!city) return "";
                return typeof city === "string" ? city : city.name || "";
              };

              const safeString = (
                value: string | number | boolean | null | undefined
              ): string => {
                return value != null ? String(value) : "";
              };

              const safePhones = (
                phones: (string | number)[] | undefined
              ): string[] => {
                if (!Array.isArray(phones)) return [];
                return phones.map((phone) => safeString(phone));
              };

              const latitude = office.latitude ?? office.location?.latitude;
              const longitude = office.longitude ?? office.location?.longitude;

              return {
                id: safeString(office.id),
                name: `Спиди офис ${safeString(office.name)}`,
                address: {
                  full: safeString(
                    office.fullAddress || office.address?.fullAddress || ""
                  ),
                  city: getCityName(office.city || office.address?.city),
                  street: safeString(
                    office.street || office.address?.street || ""
                  ),
                  number: safeString(office.num || office.address?.num || ""),
                  quarter: safeString(
                    office.quarter || office.address?.quarter || ""
                  ),
                  other: safeString(
                    office.other || office.address?.other || ""
                  ),
                  workTime,
                },
                phones: safePhones(office.phones),
                workTime,
                isMachine: Boolean(office.isAPS || office.isMachine),
                latitude: latitude,
                longitude: longitude,
                weeklySchedule,
              };
            }
          );
          setOffices(formattedOffices);
        }
      } catch (error) {
        console.error("Грешка при зареждане на офиси:", error);
        setError("Грешка при зареждане на офиси. Моля, опитайте отново.");
        setOffices([]);
      } finally {
        setIsLoadingOffices(false);
      }
    },
    []
  );

  const handleDeliveryMethodChange = useCallback(
    async (method: "speedy" | "econt" | "address") => {
      setFormData((prev) => ({
        ...prev,
        deliveryMethod: method,
        officeId: "",
        ...(method !== "address" ? { address: "" } : {}),
      }));

      const cityName = formData.city.split(",")[0].trim();
      if (method !== "address" && cityName) {
        await fetchOffices(method, cityName);
      }
    },
    [formData.city, fetchOffices]
  );

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const target = e.target as HTMLInputElement;
      const { name, value, type } = target;
      const checked = target.type === "checkbox" ? target.checked : undefined;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const steps = ["Данни за доставка", "Начин на доставка", "Потвърждение"];

  const deliveryOptions: DeliveryOption[] = [
    {
      id: "address",
      title: "Доставка до адрес",
      shortTitle: "До адрес",
      description: "Доставка директно на посочения от вас адрес",
      icon: (
        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
      ),
      price: "9.90 лв.",
      color: "blue",
    },
    {
      id: "speedy",
      title: "До офис на Спиди",
      shortTitle: "До Спиди",
      description: "Вземете пратката от най-близкия офис на Спиди",
      icon: (
        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
      ),
      price: "5.20 лв.",
      color: "red",
    },
    {
      id: "econt",
      title: "До офис на Еконт",
      shortTitle: "До Еконт",
      description: "Вземете пратката от най-близкия офис на Еконт",
      icon: (
        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 dark:text-orange-400" />
      ),
      price: "6.90 лв.",
      color: "orange",
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[50vh]">
        <CircularProgress message="Зареждане на данните на поръчката..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Вашата количка е празна
        </h2>
        <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Разгледайте нашите продукти
        </button>
      </div>
    );
  }

  const handleNextStep = () => {
    if (currentStep === 0) {
      let requiredFields = [
        { field: formData.firstName, name: "Име" },
        { field: formData.lastName, name: "Фамилия" },
        { field: formData.email, name: "Имейл" },
        { field: formData.phone, name: "Телефон" },
        { field: formData.city, name: "Град" },
      ];

      if (formData.region !== undefined) {
        requiredFields.push({ field: formData.region, name: "Област" });
      }
      if (formData.municipality !== undefined) {
        requiredFields.push({ field: formData.municipality, name: "Община" });
      }

      if (formData.deliveryMethod === "address") {
        requiredFields.push({
          field: formData.address,
          name: "Пълен адрес за доставка",
        });
      }

      if (currentStep === 0) {
        requiredFields = requiredFields.filter(
          (f) => f.name !== "Пълен адрес за доставка"
        );
      }

      requiredFields.forEach((field) => {
        console.log(
          `Field ${field.name}:`,
          field.field ? `"${field.field}"` : "empty"
        );
      });

      const hasMissing = requiredFields.some((f) => {
        const isEmpty = !f.field || String(f.field).trim() === "";
        if (isEmpty) {
          console.log(`Missing required field: ${f.name}`);
        }
        return isEmpty;
      });

      if (hasMissing) {
        setError("Моля, попълнете всички задължителни полета!");
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        setError("Моля, въведете валиден имейл адрес!");
        return;
      }

      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Моля, въведете валиден телефонен номер!");
        return;
      }
    } else if (currentStep === 1) {
      if (formData.deliveryMethod === "address" && !formData.address) {
        setError(
          "Моля, посочете адреса, на който искате да получите поръчката си!"
        );
        return;
      }

      if (formData.deliveryMethod !== "address" && !formData.officeId) {
        const deliveryService =
          formData.deliveryMethod === "speedy" ? "Спиди" : "Еконт";
        setError(
          `Моля, изберете офис на ${deliveryService}, в който искате да получите поръчката си!`
        );
        return;
      }
    }

    setError(null);
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      setError("Трябва да се съгласите с общите условия, за да продължите.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Поръчката е приета успешно!");
    } catch (err) {
      setError(
        "Възникна грешка при обработката на поръчката. Моля, опитайте отново."
      );
      console.error("Order submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                  setFormData((prev) => ({ ...prev, city: value }))
                }
                onSelect={async (settlement) => {
                  setFormData((prev) => ({
                    ...prev,
                    city: `${settlement.placeName}, ${settlement.postalCode} (${
                      settlement.adminName2 || settlement.adminName1
                    })`,
                    region: settlement.adminName1,
                    municipality:
                      settlement.adminName2 || settlement.adminName1,
                  }));
                  if (formData.deliveryMethod !== "address") {
                    await fetchOffices(
                      formData.deliveryMethod,
                      settlement.placeName
                    );
                  }
                }}
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
                    onClick={() => handleDeliveryMethodChange(option.id)}
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
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Пълен адрес за доставка{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Офиси в/във{" "}
                  {formData.city ? formData.city.split("(")[0].trim() : "града"}
                </h4>

                {isLoadingOffices ? (
                  <div className="flex items-center justify-center py-8 space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Зареждане на офисите...</p>
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
                                setFormData((prev) => ({
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
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                                          Работно време по дни:
                                        </div>
                                        <table className="w-full text-xs text-left mb-2">
                                          <tbody>
                                            {office.weeklySchedule.map(
                                              (d: {
                                                day: string;
                                                time: string | null;
                                              }) => (
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
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  {office.phones?.length > 0 && (
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
                          {(() => {
                            return (
                              <DynamicOfficeMap
                                cityName={formData.city.split(",")[0] || "Град"}
                                offices={offices}
                                selectedOfficeId={formData.officeId}
                                onOfficeSelect={(officeId) =>
                                  setFormData((prev) => ({ ...prev, officeId }))
                                }
                              />
                            );
                          })()}
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
                        Въведете град, за да видите наличните офиси
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Бележки към поръчката
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
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
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Потвърдете вашата поръчка
            </h3>

            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-6 border border-transparent dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Данни за доставка
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                      {
                        offices.find(
                          (office) => office.id === formData.officeId
                        )?.name
                      }
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

            <div className="border-t pt-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Съгласявам се с{" "}
                  <a
                    href="/terms"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Общите условия
                  </a>{" "}
                  и
                  <a
                    href="/privacy"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
                  >
                    Политиката за поверителност
                  </a>
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-100vh bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          Финализиране на поръчката
        </h1>

        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div
                  className={`ml-2 mr-4 text-sm font-medium hidden md:block ${
                    index <= currentStep
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mr-4 ${
                      index < currentStep
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {renderStepContent()}

              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Назад
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg ml-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Напред
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg ml-auto disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Обработка...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Направи поръчка
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Вашата поръчка
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Вашата количка е празна
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.product.code}
                      className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-100">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                          Код: {item.product.code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Брой: {item.quantity}
                        </p>
                        {item.product.images?.[0] && (
                          <div className="mt-2 w-16 h-16 relative border rounded-md overflow-hidden dark:border-gray-700">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-sm ml-2 text-gray-800 dark:text-gray-100">
                        {(item.product.price * item.quantity).toFixed(2)} лв.
                      </p>
                    </div>
                  ))
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Стойност на продукти:</span>
                    <span>{getCartTotal().toFixed(2)} лв.</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Доставка:</span>
                    <span>
                      {formData.deliveryMethod &&
                        deliveryOptions.find(
                          (opt) => opt.id === formData.deliveryMethod
                        )?.price}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-lg text-gray-800 dark:text-gray-100">
                    <span>Общо:</span>
                    <span>
                      {formData.deliveryMethod
                        ? (
                            getCartTotal() +
                            parseFloat(
                              deliveryOptions
                                .find(
                                  (opt) => opt.id === formData.deliveryMethod
                                )
                                ?.price.replace(" лв.", "") || "0"
                            )
                          ).toFixed(2)
                        : getCartTotal().toFixed(2)}{" "}
                      лв.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
