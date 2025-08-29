
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

export const KENYAN_COUNTIES = [
  {
    name: 'Nairobi',
    subCounties: ['Westlands', 'Dagoretti North', 'Dagoretti South', 'Langata', 'Kibra', 'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North', 'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare']
  },
  {
    name: 'Mombasa',
    subCounties: ['Changamwe', 'Jomba', 'Kisauni', 'Nyali', 'Likoni', 'Mvita']
  },
  {
    name: 'Kiambu',
    subCounties: ['Gatundu South', 'Gatundu North', 'Juja', 'Thika Town', 'Ruiru', 'Githunguri', 'Kiambu', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari']
  },
  {
    name: 'Nakuru',
    subCounties: ['Nakuru Town West', 'Nakuru Town East', 'Bahati', 'Njoro', 'Molo', 'Gilgil', 'Naivasha', 'Kuresoi South', 'Kuresoi North', 'Subukia', 'Rongai']
  },
  {
    name: 'Kisumu',
    subCounties: ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach']
  },
  {
    name: 'Uasin Gishu',
    subCounties: ['Soy', 'Turbo', 'Moiben', 'Ainabkoi', 'Kapseret', 'Kesses']
  },
  {
    name: 'Machakos',
    subCounties: ['Machakos Town', 'Athi River', 'Mavoko', 'Kathiani', 'Masinga', 'Yatta', 'Kangundo', 'Matungulu']
  },
  {
    name: 'Meru',
    subCounties: ['Imenti North', 'Imenti South', 'Imenti Central', 'Tigania West', 'Tigania East', 'North Imenti', 'Buuri', 'Igembe South', 'Igembe Central', 'Igembe North']
  },
  {
    name: 'Kilifi',
    subCounties: ['Kilifi North', 'Kilifi South', 'Kaloleni', 'Rabai', 'Ganze', 'Malindi', 'Magarini']
  },
  {
    name: 'Kakamega',
    subCounties: ['Lugari', 'Likuyani', 'Malava', 'Lurambi', 'Navakholo', 'Mumias West', 'Mumias East', 'Matungu', 'Butere', 'Khwisero', 'Shinyalu', 'Ikolomani']
  }
];
