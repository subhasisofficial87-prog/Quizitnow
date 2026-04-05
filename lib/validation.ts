/**
 * Input validation utilities
 */

export const validateTopic = (topic: string): { valid: boolean; error?: string } => {
  if (!topic || !topic.trim()) {
    return { valid: false, error: 'Please enter a topic' };
  }

  const trimmed = topic.trim();

  if (trimmed.length < 10) {
    return { valid: false, error: 'Topic must be at least 10 characters' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Topic must be less than 1000 characters' };
  }

  return { valid: true };
};

export const validatePDF = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  if (!file.type.includes('pdf')) {
    return { valid: false, error: 'File must be a PDF document' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File must be smaller than 10MB' };
  }

  return { valid: true };
};

export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
  ];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be a valid image (JPG, PNG, WebP, GIF, or BMP)',
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File must be smaller than 10MB' };
  }

  return { valid: true };
};
