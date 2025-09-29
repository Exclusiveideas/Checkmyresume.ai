import { ResumeAnalysisData } from '@/types';
import OpenAI from 'openai';

// OpenAI file size limits
const OPENAI_MAX_FILE_SIZE = 512 * 1024 * 1024; // 512MB for assistants
const RECOMMENDED_MAX_SIZE = 20 * 1024 * 1024; // 20MB recommended for performance

function validateEnvironment(): { isValid: boolean; error?: string } {
  if (!process.env.OPENAI_API_KEY) {
    return {
      isValid: false,
      error: 'OpenAI API key is missing. Please add OPENAI_API_KEY to your .env.local file. Get your API key from https://platform.openai.com/api-keys'
    };
  }

  if (!process.env.OPENAI_ASSISTANT_ID) {
    return {
      isValid: false,
      error: 'OpenAI Assistant ID is missing. Please add OPENAI_ASSISTANT_ID to your .env.local file. Create an assistant at https://platform.openai.com/assistants'
    };
  }

  return { isValid: true };
}

function getOpenAIClient(): OpenAI | null {
  try {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
}

// Helper function to create a proper File object for OpenAI
function createOpenAIFile(buffer: Buffer, fileName: string, mimeType: string): File {
  // Create a Blob from the buffer - convert Buffer to Uint8Array
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { type: mimeType });
  // Create a File from the Blob
  return new File([blob], fileName, { type: mimeType });
}

export async function analyzeResume(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string
): Promise<ResumeAnalysisData> {
  // Validate environment variables
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    throw new Error(envValidation.error);
  }

  // Get OpenAI client
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('Failed to initialize OpenAI client. Please check your API key.');
  }

  const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

  // Check file size
  const fileSize = fileBuffer.length;

  if (fileSize > OPENAI_MAX_FILE_SIZE) {
    throw new Error(`File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds OpenAI's maximum limit of 512MB`);
  }

  try {
    // Upload the file to OpenAI
    
    // Create a proper File object for OpenAI
    const file = createOpenAIFile(fileBuffer, fileName, mimeType);
    
    // Upload the file to OpenAI
    let uploadedFile;
    try {
      uploadedFile = await openai.files.create({
        file: file,
        purpose: 'assistants',
      });
    } catch (uploadError: unknown) {
      // Check if it's a size issue
      const errorWithStatus = uploadError as { status?: number };
      const errorWithMessage = uploadError as Error;
      if (errorWithStatus?.status === 413 || errorWithMessage?.message?.includes('413')) {
        // If file is too large, try to extract text and send as message instead
        return await analyzeResumeAsText(fileBuffer, fileName, openai, ASSISTANT_ID);
      }

      throw uploadError;
    }

    // Create a thread with the uploaded file
    let thread;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        thread = await openai.beta.threads.create({
          messages: [
            {
              role: 'user',
              content: `Please analyze the uploaded resume and provide a comprehensive assessment using the structured format you're configured to return. Focus on:

1. Overall scoring and ranking
2. Detailed breakdown of all scoring categories
3. ATS compliance analysis
4. Keyword coverage assessment
5. Professional formatting evaluation
6. Job match likelihood
7. Prioritized recommendations for improvement

The resume has been uploaded as a file attachment.`,
              attachments: [
                {
                  file_id: uploadedFile.id,
                  tools: [{ type: 'file_search' }] // Enable file search for the assistant
                }
              ]
            }
          ]
        });

        // Validate thread creation
        if (!thread?.id) {
          throw new Error('Thread creation failed - no thread ID returned');
        }

        break; // Success, exit retry loop

      } catch (threadError) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          // Clean up uploaded file before throwing
          try {
            await openai.files.delete(uploadedFile.id);
          } catch (cleanupError) {
            console.warn('Failed to delete uploaded file after thread creation failure:', cleanupError);
          }
          throw new Error(`Failed to create thread after ${maxRetries} attempts: ${threadError instanceof Error ? threadError.message : 'Unknown error'}`);
        }

        // Exponential backoff delay
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread!.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread!.id });

    // Use environment variable or default to 120 seconds (2 minutes)
    const maxWaitTime = process.env.OPENAI_ANALYSIS_TIMEOUT
      ? parseInt(process.env.OPENAI_ANALYSIS_TIMEOUT, 10)
      : 120000; // 120 seconds max wait
    const startTime = Date.now();
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        // Clean up the uploaded file
        try {
          await openai.files.delete(uploadedFile.id);
        } catch (cleanupError) {
          // Silent cleanup
        }
        throw new Error('Analysis timeout - the file may be too complex or large');
      }

      // Poll every 2 seconds instead of 1 to reduce API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread!.id });
    }

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread!.id);
      const response = messages.data[0];

      if (response.content[0].type === 'text') {
        const content = response.content[0].text.value;

        try {
          // Extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in response');
          }

          const analysis = JSON.parse(jsonMatch[0]) as ResumeAnalysisData;

          // Clean up the uploaded file
          try {
            await openai.files.delete(uploadedFile.id);
          } catch (cleanupError) {
            // Silent cleanup
          }

          return analysis;
        } catch (parseError) {
          // Clean up the uploaded file even on parse error
          try {
            await openai.files.delete(uploadedFile.id);
          } catch (cleanupError) {
            // Silent cleanup
          }

          throw new Error('Failed to parse resume analysis');
        }
      }
    } else if (runStatus.status === 'failed') {
      const errorMessage = runStatus.last_error?.message || 'Unknown error';
      
      // Clean up the uploaded file
      try {
        await openai.files.delete(uploadedFile.id);
      } catch (cleanupError) {
        // Silent cleanup
      }
      
      // Provide more specific error messages
      if (errorMessage.includes('file') || errorMessage.includes('format')) {
        throw new Error('The file format is not supported or the file is corrupted');
      }
      
      throw new Error(`Assistant run failed: ${errorMessage}`);
    } else if (runStatus.status === 'cancelled' || runStatus.status === 'cancelling') {
      // Clean up the uploaded file
      try {
        await openai.files.delete(uploadedFile.id);
      } catch (cleanupError) {
        // Silent cleanup
      }
      
      throw new Error('Analysis was cancelled');
    } else if (runStatus.status === 'expired') {
      // Clean up the uploaded file
      try {
        await openai.files.delete(uploadedFile.id);
      } catch (cleanupError) {
        // Silent cleanup
      }
      
      throw new Error('Analysis expired - please try again');
    }

    // Clean up the uploaded file if we reach here
    try {
      await openai.files.delete(uploadedFile.id);
    } catch (cleanupError) {
      console.warn('Failed to delete uploaded file:', cleanupError);
    }
    
    throw new Error('Failed to get response from assistant');
    
  } catch (error) {
    if (error instanceof Error) {
      // Check for specific OpenAI error types
      if (error.message.includes('file_not_found')) {
        throw new Error('File upload failed - please try again');
      }
      if (error.message.includes('invalid_file_format')) {
        throw new Error('Invalid file format - please upload a PDF, DOCX, or TXT file');
      }
      if (error.message.includes('file_too_large')) {
        throw new Error('File is too large - please upload a file under 5MB');
      }
      
      throw error;
    }
    
    throw new Error('Failed to analyze resume');
  }
}

// Fallback function to analyze resume as text when file upload fails
async function analyzeResumeAsText(
  fileBuffer: Buffer,
  fileName: string,
  openai: OpenAI,
  ASSISTANT_ID: string
): Promise<ResumeAnalysisData> {
  try {
    // Extract text from the buffer
    let resumeText = '';
    
    // Try to extract text based on file type
    if (fileName.toLowerCase().endsWith('.pdf')) {
      // Basic PDF text extraction
      const pdfText = fileBuffer.toString('binary');
      const textMatches = pdfText.match(/(?:BT\s*\/F\d+\s+\d+\s+Tf\s*)(.*?)(?:ET)/g);
      
      if (textMatches) {
        resumeText = textMatches.join(' ').replace(/[^\x20-\x7E]/g, ' ').trim();
      }
      
      // Fallback extraction
      if (resumeText.length < 100) {
        resumeText = fileBuffer
          .toString('utf8', 0, Math.min(fileBuffer.length, 100000))
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } else {
      // For DOCX, TXT, and other formats
      resumeText = fileBuffer
        .toString('utf8', 0, Math.min(fileBuffer.length, 100000))
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Truncate text if it's too long (OpenAI has token limits)
    const MAX_TEXT_LENGTH = 30000; // Approximately 7500 tokens
    if (resumeText.length > MAX_TEXT_LENGTH) {
      resumeText = resumeText.substring(0, MAX_TEXT_LENGTH) + '... [truncated]';
    }

    if (!resumeText || resumeText.length < 50) {
      throw new Error('Unable to extract sufficient text from the file. Please ensure it contains readable text.');
    }

    // Create a thread and analyze the text
    let thread;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        thread = await openai.beta.threads.create();

        // Validate thread creation
        if (!thread?.id) {
          throw new Error('Thread creation failed - no thread ID returned');
        }

        break; // Success, exit retry loop

      } catch (threadError) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to create thread after ${maxRetries} attempts: ${threadError instanceof Error ? threadError.message : 'Unknown error'}`);
        }

        // Exponential backoff delay
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    await openai.beta.threads.messages.create(thread!.id, {
      role: 'user',
      content: `Please analyze this resume and provide a comprehensive assessment using the structured format you're configured to return. Focus on:

1. Overall scoring and ranking
2. Detailed breakdown of all scoring categories
3. ATS compliance analysis
4. Keyword coverage assessment
5. Professional formatting evaluation
6. Job match likelihood
7. Prioritized recommendations for improvement

Resume content:
${resumeText}`,
    });

    const run = await openai.beta.threads.runs.create(thread!.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread!.id });

    // Use environment variable or default to 120 seconds (2 minutes)
    const maxWaitTime = process.env.OPENAI_ANALYSIS_TIMEOUT
      ? parseInt(process.env.OPENAI_ANALYSIS_TIMEOUT, 10)
      : 120000; // 120 seconds max wait
    const startTime = Date.now();

    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Analysis timeout - please try again');
      }

      // Poll every 2 seconds instead of 1 to reduce API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread!.id });
    }

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread!.id);
      const response = messages.data[0];
      
      if (response.content[0].type === 'text') {
        const content = response.content[0].text.value;
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in response');
          }
          
          const analysis = JSON.parse(jsonMatch[0]) as ResumeAnalysisData;
          return analysis;
        } catch (parseError) {
          throw new Error('Failed to parse resume analysis');
        }
      }
    }

    throw new Error(`Analysis failed: ${runStatus.last_error?.message || 'Unknown error'}`);
  } catch (error) {
    throw error;
  }
}

// Alternative approach using vector store if you want to use it
// Currently commented out due to API changes and incomplete implementation
/*
export async function analyzeResumeWithVectorStore(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string
): Promise<ResumeAnalysisData> {
  throw new Error('Implementation incomplete - use main analyzeResume function');
}
*/