import { analyzeResume } from '@/lib/openai';
import { markAnalysisComplete, storeEmail } from '@/lib/supabase-admin';
import { generateErrorMessage, validateFile } from '@/lib/utils';
import { ApiResponse, ResumeAnalysisData } from '@/types';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const runtime = 'nodejs';
// Set maximum duration for this API route (in seconds)
// Note: Vercel has limits based on plan (Hobby: 10s, Pro: 60s, Enterprise: 900s)
// For local/self-hosted deployments, this can be higher
export const maxDuration = 120; // 2 minutes

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - increased from 5MB but still reasonable
const OPENAI_RECOMMENDED_SIZE = 2 * 1024 * 1024; // 2MB for optimal performance

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

async function parseFormData(req: NextRequest): Promise<{ file: File; email: string }> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (file.size === 0) {
      throw new Error('File cannot be empty');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      throw new Error(`File size exceeds maximum limit of ${maxSizeMB}MB`);
    }
    
    return { file, email: email.trim() };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse form data');
  }
}

function getMockResponse(): ResumeAnalysisData {
  try {
    const mockFilePath = path.join(process.cwd(), 'public', 'resume-analysis.json');
    const mockData = fs.readFileSync(mockFilePath, 'utf-8');
    return JSON.parse(mockData);
  } catch (error) {
    console.error('Error loading mock response:', error);
    throw new Error('Failed to load mock response data');
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

    let parsedData: { file: File; email: string };
    try {
      parsedData = await parseFormData(req);
    } catch (parseError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: generateErrorMessage(parseError) },
        { status: 400 }
      );
    }

    const { file, email } = parsedData;
    
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

    // Store email in database (non-blocking - don't fail if this doesn't work)
    try {
      await storeEmail(email, file.name);
    } catch (emailError) {
      console.warn('Failed to store email, continuing with analysis:', emailError);
    }

    let analysis;
    
    // Check if we're in development mode
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('📝 Development mode: Using mock response');
      try {
        analysis = getMockResponse();
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (mockError) {
        console.error('Mock response error:', mockError);
        return NextResponse.json<ApiResponse>(
          { 
            success: false, 
            error: 'Failed to load development test data. Please check if resume-analysis.json exists in the public folder.' 
          },
          { status: 500 }
        );
      }
    } else {
      try {
        // Convert File to Buffer for OpenAI upload
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Pass the file directly to OpenAI
        analysis = await analyzeResume(fileBuffer, file.name, file.type);
      } catch (aiError) {
        
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
        } else if (errorMessage.includes('file format') || errorMessage.includes('unsupported')) {
          statusCode = 400;
          userMessage = 'The uploaded file format is not supported. Please upload a PDF, DOCX, or TXT file.';
        }

        return NextResponse.json<ApiResponse>(
          { 
            success: false, 
            error: userMessage
          },
          { status: statusCode }
        );
      }
    }

    // Mark analysis as complete (non-blocking)
    try {
      await markAnalysisComplete(email);
    } catch (completeError) {
      console.warn('Failed to mark analysis as complete:', completeError);
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