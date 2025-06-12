
export const validateKRAPin = (pin: string): boolean => {
  // KRA PIN format: A123456789Z (Letter + 9 digits + Letter)
  const kraRegex = /^[A-Z]\d{9}[A-Z]$/;
  return kraRegex.test(pin);
};

export const validateMpesaNumber = (number: string): boolean => {
  // M-Pesa numbers in Kenya: start with 254 or +254, followed by 7, 1, or 0
  const mpesaRegex = /^(\+?254|0)(7\d{8}|1\d{8})$/;
  return mpesaRegex.test(number);
};

export const validateKenyanPhone = (phone: string): boolean => {
  // Kenyan phone numbers: +254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX
  const phoneRegex = /^(\+?254|0)(7\d{8}|1\d{8}|2\d{8})$/;
  return phoneRegex.test(phone);
};

export const calculateVAT = (amount: number, rate: number = 0.16): { vat: number; total: number } => {
  const vat = amount * rate;
  const total = amount + vat;
  return { vat, total };
};

export const formatKenyanCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatMpesaNumber = (number: string): string => {
  // Convert to international format if needed
  if (number.startsWith('0')) {
    return `+254${number.substring(1)}`;
  }
  if (number.startsWith('254') && !number.startsWith('+')) {
    return `+${number}`;
  }
  return number;
};
