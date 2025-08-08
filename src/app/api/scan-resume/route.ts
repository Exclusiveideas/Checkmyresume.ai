import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/openai';
import { validateFile, generateErrorMessage } from '@/lib/utils';
import { ApiResponse } from '@/types';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 requests per minute

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  const allowed = record.count < maxRequests;
  if (allowed) {
    record.count++;
  }

  rateLimitMap.set(ip, record);

  return {
    allowed,
    remaining: Math.max(0, maxRequests - record.count),
    resetTime: record.resetTime,
  };
}

async function parseFormData(req: NextRequest): Promise<{ file: File }> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (file.size === 0) {
      throw new Error('File cannot be empty');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      throw new Error(`File size exceeds maximum limit of ${maxSizeMB}MB`);
    }
    
    return { file };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse form data');
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || '';
    
    if (fileName.toLowerCase().endsWith('.pdf')) {
      let text = '';
      const pdfText = fileBuffer.toString('binary');
      
      // Simple PDF text extraction (for more complex PDFs, consider using a proper PDF library)
      const textMatches = pdfText.match(/(?:BT\s*\/F\d+\s+\d+\s+Tf\s*)(.*?)(?:ET)/g);
      if (textMatches) {
        text = textMatches.join(' ').replace(/[^\x20-\x7E]/g, ' ').trim();
      }
      
      if (text.length < 50) {
        const simpleExtraction = fileBuffer
          .toString('utf8', 0, Math.min(fileBuffer.length, 50000))
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        text = simpleExtraction;
      }
      
      return text.length > 50 ? text : 
        'Resume content extracted. Please ensure your PDF contains selectable text for better analysis.';
    } 
    else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
      const text = fileBuffer
        .toString('utf8')
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      return text.length > 50 ? text : 
        'Document content extracted. File appears to be in Word format.';
    }
    
    // Generic text extraction for other file types
    const text = fileBuffer
      .toString('utf8', 0, Math.min(fileBuffer.length, 50000))
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    return text.length > 50 ? text : 'File content extracted for analysis.';
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '127.0.0.1';

    const rateLimit = getRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'Invalid request format. Please ensure you are uploading a file properly.' 
        },
        { status: 400 }
      );
    }

    let parsedData: { file: File };
    try {
      parsedData = await parseFormData(req);
    } catch (parseError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: generateErrorMessage(parseError) },
        { status: 400 }
      );
    }

    const { file } = parsedData;
    
    // Validate the file using the Web API File object directly
    const validation = validateFile(file, MAX_FILE_SIZE);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: validation.errors.join(', ')
        },
        { status: 400 }
      );
    }

    let resumeText: string;
    try {
      resumeText = await extractTextFromFile(file);
    } catch (extractError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: generateErrorMessage(extractError) },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'Unable to extract sufficient text from resume. Please ensure the file contains readable text.' 
        },
        { status: 400 }
      );
    }

    let analysis;
    try {
      analysis = await analyzeResume(resumeText);
    } catch (aiError) {
      console.error('OpenAI analysis error:', aiError);
      
      // Check if this is a configuration error
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
      let statusCode = 500;
      let userMessage = 'Failed to analyze resume. Please try again later.';

      if (errorMessage.includes('API key') || errorMessage.includes('OPENAI_API_KEY')) {
        statusCode = 503;
        userMessage = 'Service configuration issue: OpenAI API key is missing or invalid. Please contact support or check your environment configuration.';
      } else if (errorMessage.includes('Assistant ID') || errorMessage.includes('OPENAI_ASSISTANT_ID')) {
        statusCode = 503;
        userMessage = 'Service configuration issue: OpenAI Assistant is not properly configured. Please contact support or check your environment configuration.';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        statusCode = 429;
        userMessage = 'Service is currently experiencing high demand. Please try again in a few minutes.';
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        statusCode = 503;
        userMessage = 'Network connectivity issue. Please check your internet connection and try again.';
      }

      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: userMessage
        },
        { status: statusCode }
      );
    }

    return NextResponse.json<ApiResponse>(
      { 
        success: true, 
        data: analysis,
        message: 'Resume analyzed successfully' 
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    );

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json<ApiResponse>(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}