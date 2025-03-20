/**
 * Safely parses a JSON string, with proper error handling
 * 
 * @param {string} jsonString - The string to parse as JSON
 * @returns {Object|null} The parsed object or null if parsing failed
 */
export function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

/**
 * Extracts text content from a PDF buffer
 * 
 * @param {Buffer} pdfBuffer - PDF file as a buffer
 * @returns {Promise<string>} Extracted text content
 */
export async function extractTextFromPdfBuffer(pdfBuffer) {
  // Implementation would go here
  // This is a placeholder since the actual implementation is in api/process-pdf.js
  return 'PDF text content';
}

/**
 * Splits text into chunks of approximately the given token size
 * 
 * @param {string} text - The text to split
 * @param {number} maxTokens - Maximum tokens per chunk
 * @returns {Array<string>} Array of text chunks
 */
export function splitTextIntoChunks(text, maxTokens = 8000) {
  // Approximate tokens: 1 token ≈ 4 characters for English text
  const charsPerToken = 4;
  const maxChars = maxTokens * charsPerToken;
  
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxChars;
    
    // Don't split in the middle of a paragraph
    if (end < text.length) {
      const nextParagraph = text.indexOf('\n\n', end);
      if (nextParagraph !== -1 && nextParagraph - end < 500) {
        end = nextParagraph;
      } else {
        const nextNewline = text.indexOf('\n', end);
        if (nextNewline !== -1 && nextNewline - end < 100) {
          end = nextNewline;
        } else {
          const nextSpace = text.indexOf(' ', end);
          if (nextSpace !== -1 && nextSpace - end < 20) {
            end = nextSpace;
          }
        }
      }
    } else {
      end = text.length;
    }
    
    chunks.push(text.slice(start, end));
    start = end;
  }
  
  return chunks;
}