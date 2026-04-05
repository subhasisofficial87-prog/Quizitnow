import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // Create an image URL for Tesseract
    const imageUrl = URL.createObjectURL(blob);

    // Run Tesseract OCR
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => {
        // Optional: log progress
        console.log('OCR Progress:', m.status, m.progress);
      },
    });

    // Clean up
    URL.revokeObjectURL(imageUrl);

    const text = result.data.text.trim();

    if (text.length < 10) {
      throw new Error(
        'Image contains very little text. Please try a different image.'
      );
    }

    return text;
  } catch (error) {
    throw new Error(
      `Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'File must be an image (JPG, PNG, WebP, or GIF)' };
  }

  // Check file size (max 5MB for images)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
};
