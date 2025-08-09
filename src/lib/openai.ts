import { ResumeAnalysisData } from '@/types';
import OpenAI from 'openai';

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

// Helper function to determine file purpose based on MIME type
function getFilePurpose(mimeType: string): 'assistants' | 'fine-tune' {
  // For assistant file uploads, we use 'assistants' purpose
  return 'assistants';
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

  try {
    // Upload the file to OpenAI
    console.log('Uploading file to OpenAI:', fileName);
    
    // Create a File object from the buffer
    const file = new File([fileBuffer], fileName, { type: mimeType });
    
    // Upload the file to OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: getFilePurpose(mimeType),
    });

    console.log('File uploaded successfully:', uploadedFile.id);

    // Create a thread with the uploaded file
    const thread = await openai.beta.threads.create({
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

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    const maxWaitTime = 60000; // 60 seconds max wait
    const startTime = Date.now();
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        // Clean up the uploaded file
        try {
          await openai.files.del(uploadedFile.id);
        } catch (cleanupError) {
          console.warn('Failed to delete uploaded file:', cleanupError);
        }
        throw new Error('Analysis timeout - the file may be too complex or large');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
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
            await openai.files.del(uploadedFile.id);
            console.log('File deleted successfully:', uploadedFile.id);
          } catch (cleanupError) {
            console.warn('Failed to delete uploaded file:', cleanupError);
          }
          
          return analysis;
        } catch (parseError) {
          // Clean up the uploaded file even on parse error
          try {
            await openai.files.del(uploadedFile.id);
          } catch (cleanupError) {
            console.warn('Failed to delete uploaded file:', cleanupError);
          }
          
          console.error('Failed to parse OpenAI response:', parseError);
          throw new Error('Failed to parse resume analysis');
        }
      }
    } else if (runStatus.status === 'failed') {
      // Clean up the uploaded file
      try {
        await openai.files.del(uploadedFile.id);
      } catch (cleanupError) {
        console.warn('Failed to delete uploaded file:', cleanupError);
      }
      
      const errorMessage = runStatus.last_error?.message || 'Unknown error';
      console.error('Assistant run failed:', errorMessage);
      
      // Provide more specific error messages
      if (errorMessage.includes('file') || errorMessage.includes('format')) {
        throw new Error('The file format is not supported or the file is corrupted');
      }
      
      throw new Error(`Assistant run failed: ${errorMessage}`);
    } else if (runStatus.status === 'cancelled' || runStatus.status === 'cancelling') {
      // Clean up the uploaded file
      try {
        await openai.files.del(uploadedFile.id);
      } catch (cleanupError) {
        console.warn('Failed to delete uploaded file:', cleanupError);
      }
      
      throw new Error('Analysis was cancelled');
    } else if (runStatus.status === 'expired') {
      // Clean up the uploaded file
      try {
        await openai.files.del(uploadedFile.id);
      } catch (cleanupError) {
        console.warn('Failed to delete uploaded file:', cleanupError);
      }
      
      throw new Error('Analysis expired - please try again');
    }

    // Clean up the uploaded file if we reach here
    try {
      await openai.files.del(uploadedFile.id);
    } catch (cleanupError) {
      console.warn('Failed to delete uploaded file:', cleanupError);
    }
    
    throw new Error('Failed to get response from assistant');
    
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    
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

// Alternative approach using vector store if you want to use it
export async function analyzeResumeWithVectorStore(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string
): Promise<ResumeAnalysisData> {
  // Validate environment variables
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    throw new Error(envValidation.error);
  }

  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('Failed to initialize OpenAI client');
  }

  const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

  try {
    // Create a File object from the buffer
    const file = new File([fileBuffer], fileName, { type: mimeType });
    
    // Upload the file
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    // Create a vector store
    const vectorStore = await openai.beta.vectorStores.create({
      name: `Resume Analysis - ${Date.now()}`,
      file_ids: [uploadedFile.id],
    });

    // Wait for vector store to be ready
    let vectorStoreStatus = await openai.beta.vectorStores.retrieve(vectorStore.id);
    while (vectorStoreStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      vectorStoreStatus = await openai.beta.vectorStores.retrieve(vectorStore.id);
    }

    if (vectorStoreStatus.status !== 'completed') {
      throw new Error('Failed to process file in vector store');
    }

    // Update assistant to use the vector store (if needed)
    // Note: This assumes your assistant is already configured with file_search tool
    
    // Create thread and run analysis
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `Please analyze the resume in the vector store and provide a comprehensive assessment...`,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id]
        }
      }
    });

    // ... rest of the analysis logic ...

    // Clean up: Delete vector store and file
    await openai.beta.vectorStores.del(vectorStore.id);
    await openai.files.del(uploadedFile.id);

    // Return analysis
    throw new Error('Implementation incomplete - use main analyzeResume function');
  } catch (error) {
    console.error('Vector store analysis error:', error);
    throw error;
  }
}