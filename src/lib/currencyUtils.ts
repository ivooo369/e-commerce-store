const BGN_TO_EUR_RATE = 1.95583;

export const convertBgnToEur = (bgn: number): number => {
  return Number((bgn / BGN_TO_EUR_RATE).toFixed(2));
};

export const formatPrice = (price: number, currency: 'BGN' | 'EUR' = 'BGN'): string => {
  if (currency === 'EUR') {
    const eurPrice = convertBgnToEur(price);
    return `${eurPrice.toFixed(2)} €`;
  }
  return `${price.toFixed(2)} лв.`;
};
