import * as Sentry from '@sentry/node';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { pipeline } from 'stream/promises';
import PDFParse from 'pdf-parse';
import { OpenAI } from 'openai';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.VITE_PUBLIC_APP_ID
    }
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log('PDF processing request received');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Check for the PDF file in the request
    const formData = await parseFormData(req);
    const file = formData.get('pdf');
    
    if (!file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Save the file to a temporary location
    const fileName = `upload-${Date.now()}.pdf`;
    const filePath = join(tmpdir(), fileName);
    
    await saveFile(file, filePath);
    console.log('PDF file saved temporarily at:', filePath);

    // Extract text from PDF
    const pdfContent = await extractTextFromPDF(filePath);
    console.log('PDF text extracted, length:', pdfContent.length);

    // Extract code snippets from the PDF text
    const codeSnippets = extractCodeSnippets(pdfContent);
    console.log('Code snippets extracted:', codeSnippets.length);

    // Generate embeddings for the text content
    const embeddings = await generateEmbeddings(pdfContent);
    console.log('Embeddings generated');

    // Return the processed data
    return res.status(200).json({
      text: pdfContent,
      codeSnippets,
      embeddings
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to process PDF: ' + error.message });
  }
}

// Parse multipart form data
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    let data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', () => {
      const buffer = Buffer.concat(data);
      const boundary = getBoundary(req.headers['content-type']);
      if (!boundary) {
        return reject(new Error('No boundary found in content-type'));
      }
      
      const formData = new FormData();
      const parts = parseMultipartFormData(buffer, boundary);
      
      for (const part of parts) {
        if (part.filename) {
          const file = new File([part.data], part.filename, { type: part.contentType });
          formData.append(part.name, file);
        } else {
          formData.append(part.name, new TextDecoder().decode(part.data));
        }
      }
      
      resolve(formData);
    });
    req.on('error', reject);
  });
}

// Extract boundary from content-type header
function getBoundary(contentType) {
  if (!contentType) return null;
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? (match[1] || match[2]) : null;
}

// Parse multipart form data buffer
function parseMultipartFormData(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);
  
  let start = buffer.indexOf(boundaryBuffer);
  const parts = [];
  
  while (start !== -1) {
    // Find the end of this part
    let end = buffer.indexOf(boundaryBuffer, start + boundaryBuffer.length);
    if (end === -1) {
      // Check for end boundary
      end = buffer.indexOf(endBoundaryBuffer, start + boundaryBuffer.length);
      if (end === -1) break;
    }
    
    // Extract header and body
    const headerEnd = buffer.indexOf('\r\n\r\n', start);
    if (headerEnd === -1) break;
    
    const headerStr = buffer.slice(start + boundaryBuffer.length + 2, headerEnd).toString();
    const headers = parseHeaders(headerStr);
    
    const bodyStart = headerEnd + 4;
    const bodyEnd = end - 2; // Exclude \r\n before the boundary
    
    const contentDisposition = headers['content-disposition'] || '';
    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    
    parts.push({
      name: nameMatch ? nameMatch[1] : '',
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: headers['content-type'] || null,
      data: buffer.slice(bodyStart, bodyEnd)
    });
    
    start = end;
  }
  
  return parts;
}

// Parse headers from string
function parseHeaders(headerStr) {
  const headers = {};
  const lines = headerStr.split('\r\n');
  
  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex !== -1) {
      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();
      headers[key] = value;
    }
  }
  
  return headers;
}

// Save file from multipart form data
async function saveFile(file, filePath) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);
  return filePath;
}

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = await readFile(filePath);
  const data = await PDFParse(dataBuffer);
  return data.text;
}

// Read file as buffer
function readFile(filePath) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = createReadStream(filePath);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Extract code snippets from text
function extractCodeSnippets(text) {
  const codeSnippets = [];
  
  // Look for code blocks marked with indentation and common patterns
  const codePatterns = [
    // Code blocks with triple backticks
    /```(?:\w*\n)?([\s\S]*?)```/g,
    
    // Code blocks with consistent indentation (4+ spaces)
    /(?:^|\n)( {4,}[\w(].+(?:\n {4,}.+)*)/g,
    
    // Lines starting with common code indicators
    /(?:^|\n)(?:function|def|class|import|from|public|private|var|let|const)[ \t].+(?:\{|\:)/gm
  ];
  
  for (const pattern of codePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const snippet = match[1] || match[0];
      // Only add snippet if it's longer than 20 chars and looks like code
      if (snippet.length > 20 && isLikelyCode(snippet)) {
        codeSnippets.push(snippet.trim());
      }
    }
  }
  
  return [...new Set(codeSnippets)]; // Remove duplicates
}

// Check if a string is likely to be code
function isLikelyCode(text) {
  // Programming keywords that indicate code
  const codeKeywords = [
    'function', 'return', 'if', 'else', 'for', 'while', 'class',
    'import', 'export', 'from', 'def', 'print', 'var', 'let', 'const',
    '= function', '=>', 'public', 'private', 'static'
  ];
  
  // Check for presence of code-like patterns
  return codeKeywords.some(keyword => text.includes(keyword)) ||
    text.includes('{') || text.includes('}') || 
    text.includes('(') || text.includes(')') ||
    /[a-zA-Z0-9]+=/.test(text) || // assignment
    /[\[\]<>]/.test(text); // brackets
}

// Generate embeddings for the text
async function generateEmbeddings(text) {
  try {
    // Split the text into chunks (max 8000 tokens per chunk)
    const chunks = splitTextIntoChunks(text, 8000);
    const embeddings = [];
    
    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk
      });
      
      embeddings.push({
        text: chunk,
        embedding: response.data[0].embedding
      });
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings: ' + error.message);
  }
}

// Split text into chunks based on token count (rough estimate)
function splitTextIntoChunks(text, maxTokens) {
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