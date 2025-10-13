import React from "react";
import { MapPin, Truck, Package } from "lucide-react";
import type { DeliveryOption } from "@/lib/types/interfaces";

export const deliveryOptions: DeliveryOption[] = [
  {
    id: "address",
    title: "Доставка до адрес",
    shortTitle: "До адрес",
    description: "Доставка директно на посочения от вас адрес",
    icon: React.createElement(MapPin, {
      className: "w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400",
    }),
    price: "9.90 лв. / 5.06 €",
    color: "blue",
  },
  {
    id: "speedy",
    title: "До офис на Спиди",
    shortTitle: "До Спиди",
    description: "Вземете пратката от най-близкия офис на Спиди",
    icon: React.createElement(Truck, {
      className: "w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400",
    }),
    price: "5.20 лв. / 2.66 €",
    color: "red",
  },
  {
    id: "econt",
    title: "До офис на Еконт",
    shortTitle: "До Еконт",
    description: "Вземете пратката от най-близкия офис на Еконт",
    icon: React.createElement(Package, {
      className: "w-5 h-5 sm:w-6 sm:h-6 text-orange-500 dark:text-orange-400",
    }),
    price: "6.90 лв. / 3.53 €",
    color: "orange",
  },
];

export const SHIPPING_COSTS = {
  ADDRESS: 9.9,
  SPEEDY: 5.2,
  ECONT: 6.9,
} as const;

export function getDeliveryMethod(address: string) {
  if (!address) return "ADDRESS";
  const normalizedAddress = address.toLowerCase();
  if (normalizedAddress.includes("спиди")) return "SPEEDY";
  if (
    normalizedAddress.includes("еконт") ||
    normalizedAddress.includes("econt")
  )
    return "ECONT";
  return "ADDRESS";
}

export function calculateShippingCost(deliveryMethod: string): number {
  return (
    SHIPPING_COSTS[deliveryMethod as keyof typeof SHIPPING_COSTS] ||
    SHIPPING_COSTS.ADDRESS
  );
}
