export interface LoadingMessage {
  message: string;
  timestamp: number; // seconds
}

export const LOADING_MESSAGES: LoadingMessage[] = [
  { message: "Analyzing your resume with AI...", timestamp: 0 },
  { message: "Reading through your experience...", timestamp: 15 },
  { message: "Checking ATS compatibility...", timestamp: 30 },
  { message: "Evaluating keyword coverage...", timestamp: 45 },
  { message: "Analyzing formatting and structure...", timestamp: 60 },
  { message: "Calculating your job match score...", timestamp: 75 },
  { message: "Almost done, finalizing analysis...", timestamp: 90 },
  { message: "Just a few more seconds...", timestamp: 105 },
  { message: "Wrapping up the final details...", timestamp: 115 },
];

/**
 * Get the appropriate loading message based on elapsed time
 * @param elapsedSeconds - Number of seconds elapsed since loading started
 * @returns The current loading message
 */
export function getLoadingMessage(elapsedSeconds: number): string {
  // Find the latest message where timestamp <= elapsedSeconds
  let currentMessage = LOADING_MESSAGES[0].message;

  for (const msg of LOADING_MESSAGES) {
    if (elapsedSeconds >= msg.timestamp) {
      currentMessage = msg.message;
    } else {
      break;
    }
  }

  return currentMessage;
}

/**
 * Get all loading messages for reference
 */
export function getAllMessages(): string[] {
  return LOADING_MESSAGES.map((m) => m.message);
}
