
export const counties = ['Kisumu', 'Nairobi', 'Mombasa', 'Nakuru', 'Eldoret'];

export const kisumuSubCounties = [
  'Kisumu Central', 
  'Kisumu East', 
  'Kisumu West', 
  'Nyando', 
  'Muhoroni', 
  'Nyakach'
];

export interface LocationData {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const kisumuLocations: Record<string, LocationData[]> = {
  'Kisumu Central': [
    { name: 'Central Business District', coordinates: { lat: -0.0917, lng: 34.7680 } },
    { name: 'Kondele', coordinates: { lat: -0.0856, lng: 34.7435 } },
    { name: 'Nyalenda', coordinates: { lat: -0.1089, lng: 34.7312 } },
    { name: 'Manyatta', coordinates: { lat: -0.0756, lng: 34.7789 } },
    { name: 'Railways', coordinates: { lat: -0.0934, lng: 34.7623 } },
    { name: 'Migosi', coordinates: { lat: -0.0678, lng: 34.7834 } },
    { name: 'Market Milimani', coordinates: { lat: -0.0823, lng: 34.7567 } },
    { name: 'Shauri Moyo', coordinates: { lat: -0.0945, lng: 34.7456 } },
    { name: 'Kibuye', coordinates: { lat: -0.0834, lng: 34.7712 } },
    { name: 'Tom Mboya', coordinates: { lat: -0.0923, lng: 34.7634 } }
  ],
  'Kisumu East': [
    { name: 'Kajulu', coordinates: { lat: -0.0567, lng: 34.8123 } },
    { name: 'Kolwa East', coordinates: { lat: -0.0445, lng: 34.7834 } },
    { name: 'Kolwa Central', coordinates: { lat: -0.0523, lng: 34.7756 } },
    { name: 'Miwani', coordinates: { lat: -0.0234, lng: 34.8456 } },
    { name: 'Chemelil', coordinates: { lat: -0.0145, lng: 34.8567 } },
    { name: 'Maseno', coordinates: { lat: 0.0234, lng: 34.5967 } },
    { name: 'Ahero', coordinates: { lat: -0.1234, lng: 34.9123 } },
    { name: 'Kibos', coordinates: { lat: -0.0678, lng: 34.8234 } },
    { name: 'Chiga', coordinates: { lat: -0.0345, lng: 34.7989 } },
    { name: 'Rabuor', coordinates: { lat: -0.0456, lng: 34.8045 } }
  ],
  'Kisumu West': [
    { name: 'Central Kisumu', coordinates: { lat: -0.0934, lng: 34.7512 } },
    { name: 'Kisumu North', coordinates: { lat: -0.0723, lng: 34.7634 } },
    { name: 'West Kisumu', coordinates: { lat: -0.0845, lng: 34.7234 } },
    { name: 'North West Kisumu', coordinates: { lat: -0.0656, lng: 34.7345 } },
    { name: 'Dunga', coordinates: { lat: -0.1123, lng: 34.7456 } },
    { name: 'Hippo Point', coordinates: { lat: -0.1234, lng: 34.7234 } },
    { name: 'Sunset Hotel Area', coordinates: { lat: -0.0867, lng: 34.7134 } },
    { name: 'Milimani Estate', coordinates: { lat: -0.0745, lng: 34.7423 } },
    { name: 'Lolwe Estate', coordinates: { lat: -0.0934, lng: 34.7334 } },
    { name: 'Riat Hills', coordinates: { lat: -0.0612, lng: 34.7012 } }
  ],
  'Nyando': [
    { name: 'Awasi', coordinates: { lat: -0.1567, lng: 34.8234 } },
    { name: 'Chemelil Sugar Factory', coordinates: { lat: -0.1345, lng: 34.8456 } },
    { name: 'Miwani Sugar Factory', coordinates: { lat: -0.1123, lng: 34.8567 } },
    { name: 'Nyando River', coordinates: { lat: -0.1678, lng: 34.8123 } },
    { name: 'Lower Nyakach', coordinates: { lat: -0.1456, lng: 34.7890 } },
    { name: 'Upper Nyakach', coordinates: { lat: -0.1234, lng: 34.7678 } },
    { name: 'Kochogo', coordinates: { lat: -0.1789, lng: 34.8234 } },
    { name: 'Kadibo', coordinates: { lat: -0.1567, lng: 34.8456 } },
    { name: 'Ombaka', coordinates: { lat: -0.1345, lng: 34.8567 } },
    { name: 'Kombewa', coordinates: { lat: -0.1678, lng: 34.7890 } }
  ],
  'Muhoroni': [
    { name: 'Muhoroni Town', coordinates: { lat: -0.1612, lng: 35.1987 } },
    { name: 'Chemilil', coordinates: { lat: -0.1456, lng: 35.2134 } },
    { name: 'Fort Ternan', coordinates: { lat: -0.0987, lng: 35.3456 } },
    { name: 'Tinderet', coordinates: { lat: -0.0723, lng: 35.3678 } },
    { name: 'Songhor', coordinates: { lat: -0.1234, lng: 35.2890 } },
    { name: 'Kopere', coordinates: { lat: -0.1456, lng: 35.2567 } },
    { name: 'Koru', coordinates: { lat: -0.1123, lng: 35.3234 } },
    { name: 'Miwani Estate', coordinates: { lat: -0.1678, lng: 35.1567 } },
    { name: 'Kibigori', coordinates: { lat: -0.1345, lng: 35.2789 } },
    { name: 'Chemelil Estate', coordinates: { lat: -0.1567, lng: 35.2234 } }
  ],
  'Nyakach': [
    { name: 'Nyakach Central', coordinates: { lat: -0.2134, lng: 34.6789 } },
    { name: 'West Nyakach', coordinates: { lat: -0.2345, lng: 34.6234 } },
    { name: 'North Nyakach', coordinates: { lat: -0.1987, lng: 34.6567 } },
    { name: 'South Nyakach', coordinates: { lat: -0.2567, lng: 34.6890 } },
    { name: 'Agulu', coordinates: { lat: -0.2234, lng: 34.6456 } },
    { name: 'Kabonyo', coordinates: { lat: -0.2456, lng: 34.6123 } },
    { name: 'Kanyamwa', coordinates: { lat: -0.2123, lng: 34.6789 } },
    { name: 'Masogo', coordinates: { lat: -0.2345, lng: 34.6234 } },
    { name: 'Ombeyi', coordinates: { lat: -0.2567, lng: 34.6567 } },
    { name: 'Pap Onditi', coordinates: { lat: -0.2234, lng: 34.6890 } }
  ]
};
