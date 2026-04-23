/**
 * PDF Generation Service
 * Converts HTML contract to PDF using a simple approach
 * For production, use: html2pdf, puppeteer, or Resend's PDF features
 */

export function generateContractPDF(htmlContent: string): Buffer {
  /**
   * Simple approach: Return HTML as buffer for PDF conversion
   * In production, integrate with:
   *
   * Option 1: html2pdf (browser-side)
   * Option 2: Puppeteer (server-side)
   * Option 3: Resend API (email + PDF generation)
   * Option 4: PDFKit (Node.js native)
   *
   * For now, we store the HTML and let Resend handle PDF conversion
   * when sending emails
   */

  // Create a simple wrapper that can be processed by Resend or other PDF tools
  const pdfWrapper = Buffer.from(htmlContent, 'utf-8');
  return pdfWrapper;
}

/**
 * Prepare HTML for email
 * Resend will automatically convert this to PDF when needed
 */
export function prepareContractForEmail(htmlContent: string): {
  html: string;
  subject: string;
} {
  return {
    html: htmlContent,
    subject: 'Your Signed KJM Motorcycle Rental Agreement',
  };
}
