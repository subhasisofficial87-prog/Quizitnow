/**
 * Image OCR Processing
 * Extracts text from images using Tesseract.js
 */

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    console.log('[OCR] Extracting text from:', file.name);

    // Dynamically import Tesseract.js
    const Tesseract = await import('tesseract.js');

    // Create blob from file
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Run OCR using the default export
    const result = await Tesseract.default.recognize(blob, 'eng');
    const extractedText = result.data.text.trim();

    console.log('[OCR] Extracted', extractedText.length, 'characters');
    return extractedText;
  } catch (error) {
    console.error('[OCR] Extraction error:', error);
    throw new Error(
      `Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, WebP, or GIF)' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file name
  if (!file.name) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
}
