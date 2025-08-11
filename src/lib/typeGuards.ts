
// Shared type guards for data validation across hooks

export const isRecord = (item: unknown): item is Record<string, unknown> => {
  return item !== null && item !== undefined && typeof item === 'object';
};

export const hasString = (obj: Record<string, unknown>, key: string): boolean => {
  return key in obj && typeof obj[key] === 'string';
};

export const hasNumber = (obj: Record<string, unknown>, key: string): boolean => {
  return key in obj && typeof obj[key] === 'number';
};

export const hasBoolean = (obj: Record<string, unknown>, key: string): boolean => {
  return key in obj && typeof obj[key] === 'boolean';
};

export const validateRequiredFields = (
  obj: Record<string, unknown>, 
  fields: Array<{ key: string; type: 'string' | 'number' | 'boolean' }>
): boolean => {
  return fields.every(field => {
    switch (field.type) {
      case 'string':
        return hasString(obj, field.key);
      case 'number':
        return hasNumber(obj, field.key);
      case 'boolean':
        return hasBoolean(obj, field.key);
      default:
        return false;
    }
  });
};
