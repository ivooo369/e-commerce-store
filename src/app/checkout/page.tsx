"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/utils/currency";
import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useOffices } from "@/lib/hooks/useOffices";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import { orderService } from "@/services/orderService";
import { deliveryOptions } from "@/lib/utils/delivery";
import CheckoutSteps from "@/ui/components/others/checkout-step-content";
import Box from "@mui/material/Box";
import type {
  FormDataDelivery,
  Settlement,
  CartItem,
} from "@/lib/types/interfaces";

export default function CheckoutPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors] = useState<{ agreeTerms?: string }>({});
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

  const {
    data: offices = [],
    isLoading: isLoadingOffices,
    error: officesError,
  } = useOffices(
    formData.deliveryMethod,
    formData.city.split(",")[0]?.trim() || ""
  );

  const handleDeliveryMethodChange = useCallback(
    (method: "speedy" | "econt" | "address") => {
      setFormData((prev) => ({
        ...prev,
        deliveryMethod: method,
        officeId: "",
        ...(method !== "address" ? { address: "" } : {}),
      }));
    },
    []
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

  const handleSettlementSelect = useCallback((settlement: Settlement) => {
    setFormData((prev) => ({
      ...prev,
      city: `${settlement.placeName}, ${settlement.postalCode} (${
        settlement.adminName2 || settlement.adminName1
      })`,
      region: settlement.adminName1,
      municipality: settlement.adminName2 || settlement.adminName1,
      officeId: "",
    }));
  }, []);

  const steps = ["Данни за доставка", "Начин на доставка", "Потвърждение"];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
        <CircularProgress message="Зареждане на данните за поръчката..." />
      </Box>
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
        { field: formData.city, name: "Населено място" },
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

      const hasMissing = requiredFields.some((f) => {
        const isEmpty = !f.field || String(f.field).trim() === "";
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

      const phoneRegex = /^\d{10,20}$/;
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
      let customerId = "";
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            customerId = parsedUserData.id || "";
          } catch {
            throw new Error("Възникна грешка!");
          }
        }
      }

      const orderData = {
        customerId: customerId,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        city: formData.city.split(",")[0].trim(),
        address:
          formData.deliveryMethod === "address"
            ? formData.address
            : (() => {
                const office = offices.find(
                  (office) => office.id === formData.officeId
                );
                if (!office) return `До офис: ${formData.officeId}`;
                const fullAddress =
                  office.address?.full ||
                  [office.address?.street, office.address?.number]
                    .filter(Boolean)
                    .join(" ");
                return `До офис: ${office.name}, ${fullAddress}`;
              })(),
        phone: formData.phone,
        additionalInfo: formData.notes || "",
        items: items.map((item: CartItem) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            code: item.product.code,
            price: item.product.price,
            description: item.product.description || "",
            images: item.product.images || [],
          },
          quantity: item.quantity,
        })),
      };

      const result = await orderService.createOrder(orderData);
      window.location.replace(`/order-success?orderId=${result.orderId}`);
      return;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Възникна грешка при обработка на поръчката!";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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

              <CheckoutSteps
                currentStep={currentStep}
                formData={formData}
                formErrors={formErrors}
                offices={offices}
                isLoadingOffices={isLoadingOffices}
                officesError={officesError}
                onInputChange={handleInputChange}
                onDeliveryMethodChange={handleDeliveryMethodChange}
                onFormDataChange={setFormData}
                onSettlementSelect={handleSettlementSelect}
              />

              <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="order-2 sm:order-1 flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Назад
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="order-1 sm:order-2 flex items-center justify-center font-medium px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full sm:w-auto"
                  >
                    Напред
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="order-1 sm:order-2 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 w-full sm:w-auto"
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
                  items.map((item: CartItem, index: number) => (
                    <Link
                      key={item.product.code}
                      href={`/product-catalog/details/${item.product.code}`}
                      className={`flex justify-between items-start w-full ${
                        index !== items.length - 1
                          ? "pb-3 border-b border-gray-100 dark:border-gray-700"
                          : ""
                      } hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors`}
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
                          <div className="block mt-2 w-16 h-16 relative border rounded-md overflow-hidden dark:border-gray-700 hover:opacity-90 transition-opacity">
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
                        {(item.product.price * item.quantity).toFixed(2)} лв. /{" "}
                        {formatPrice(item.product.price * item.quantity, "EUR")}
                      </p>
                    </Link>
                  ))
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Продукти:</span>
                    <span>
                      {getCartTotal().toFixed(2)} лв. /{" "}
                      {formatPrice(getCartTotal(), "EUR")}
                    </span>
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
                      {formData.deliveryMethod ? (
                        <>
                          {(
                            getCartTotal() +
                            parseFloat(
                              deliveryOptions
                                .find(
                                  (opt) => opt.id === formData.deliveryMethod
                                )
                                ?.price.split(" ")[0] || "0"
                            )
                          ).toFixed(2)}{" "}
                          лв. /{" "}
                          {formatPrice(
                            getCartTotal() +
                              parseFloat(
                                deliveryOptions
                                  .find(
                                    (opt) => opt.id === formData.deliveryMethod
                                  )
                                  ?.price.split(" ")[0] || "0"
                              ),
                            "EUR"
                          )}
                        </>
                      ) : (
                        <>
                          {getCartTotal().toFixed(2)} лв. /{" "}
                          {formatPrice(getCartTotal(), "EUR")}
                        </>
                      )}
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
