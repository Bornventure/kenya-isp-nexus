
export const convertSpeedToKbps = (speedString: string): number => {
  // Parse speed strings like "1.5 Mbps", "10 Mbps", "500 Kbps", etc.
  const speedMatch = speedString.match(/(\d+(?:\.\d+)?)\s*(mbps|kbps|gbps)/i);
  
  if (!speedMatch) {
    console.warn(`Unable to parse speed: ${speedString}, defaulting to 1000 Kbps`);
    return 1000; // Default fallback
  }
  
  const value = parseFloat(speedMatch[1]);
  const unit = speedMatch[2].toLowerCase();
  
  switch (unit) {
    case 'gbps':
      return Math.round(value * 1000 * 1000); // Gbps to Kbps
    case 'mbps':
      return Math.round(value * 1000); // Mbps to Kbps
    case 'kbps':
      return Math.round(value); // Already in Kbps
    default:
      console.warn(`Unknown speed unit: ${unit}, defaulting to 1000 Kbps`);
      return 1000;
  }
};

export const formatSpeedForRadius = (speedString: string) => {
  const kbps = convertSpeedToKbps(speedString);
  return {
    download: kbps,
    upload: Math.round(kbps * 0.5) // Upload is typically 50% of download
  };
};
