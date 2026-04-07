/**
 * PDF Text Extraction
 * Extracts text from PDF files using pdfjs-dist
 * Uses local worker files served from public folder
 */

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('[PDF] Extracting text from:', file.name);

    // Dynamically import pdfjs-dist
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');

    // Set up worker for browser environment using local files
    if (typeof window !== 'undefined') {
      try {
        // Use local worker file from public folder
        // This avoids CDN issues on Vercel
        GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
        console.log('[PDF] Worker configured from local path');
      } catch (e) {
        console.warn('[PDF] Worker configuration warning:', e);
      }
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item as any).str)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`[PDF] Error extracting page ${i}:`, pageError);
        continue;
      }
    }

    const cleanedText = fullText.trim();
    console.log('[PDF] Extracted', cleanedText.length, 'characters from', pdf.numPages, 'pages');
    return cleanedText;
  } catch (error) {
    console.error('[PDF] Extraction error:', error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file name
  if (!file.name) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
}
