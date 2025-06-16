
export const formatKenyanCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'KES 0.00';
  }
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

export const parseAmount = (amount: any): number => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    // Remove any currency symbols and parse
    const cleaned = amount.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};
