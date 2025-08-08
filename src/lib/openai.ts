import OpenAI from 'openai';
import { ResumeAnalysisData } from '@/types';

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

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysisData> {
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
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
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

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(
      run.id,
      {
        thread_id: thread.id,
      }
    );
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        run.id,
        {
          thread_id: thread.id,
        }
      );
    }

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const response = messages.data[0];
      
      if (response.content[0].type === 'text') {
        const content = response.content[0].text.value;
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in response');
          }
          
          const analysis = JSON.parse(jsonMatch[0]) as ResumeAnalysisData;
          
          // await openai.beta.threads.del(thread.id); // Note: cleanup threads manually if needed
          
          return analysis;
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          throw new Error('Failed to parse resume analysis');
        }
      }
    } else if (runStatus.status === 'failed') {
      // await openai.beta.threads.del(thread.id); // Note: cleanup threads manually if needed
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    // await openai.beta.threads.del(thread.id); // Note: cleanup threads manually if needed
    throw new Error('Failed to get response from assistant');
    
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze resume');
  }
}

// OpenAI client is now initialized per-request for better error handling