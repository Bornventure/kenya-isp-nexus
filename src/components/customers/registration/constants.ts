
export const counties = ['Kisumu', 'Nairobi', 'Mombasa', 'Nakuru', 'Eldoret'];

export const kisumuSubCounties = [
  'Kisumu Central', 
  'Kisumu East', 
  'Kisumu West', 
  'Nyando', 
  'Muhoroni', 
  'Nyakach'
];

export const clientTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'government', label: 'Government' }
] as const;

export const connectionTypes = [
  { value: 'fiber', label: 'Fiber' },
  { value: 'wireless', label: 'Wireless' },
  { value: 'satellite', label: 'Satellite' },
  { value: 'dsl', label: 'DSL' }
] as const;
