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
