# Resume Scanner AI

A full-stack Next.js application that provides AI-powered resume analysis using OpenAI's Assistant API. Upload your resume and get detailed insights on skills, ATS optimization, and professional presentation.

## Features

- 🤖 **AI-Powered Analysis**: Uses OpenAI's Assistant API for comprehensive resume evaluation
- 📊 **ATS Optimization**: Checks compatibility with Applicant Tracking Systems
- 🎯 **Skills Analysis**: Identifies technical and soft skills, plus skill gaps
- 📈 **Scoring System**: Provides numerical scores for various aspects
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔒 **Secure & Private**: Files are processed in real-time and not stored
- ⚡ **Fast Processing**: Instant analysis with real-time feedback

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **File Upload**: React Dropzone, Formidable
- **AI Integration**: OpenAI SDK with Assistant API
- **Icons**: Lucide React
- **Form Handling**: React Hook Form

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- An OpenAI API key
- An OpenAI Assistant ID (created through OpenAI platform)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd check-my-resume-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and update with your credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_ASSISTANT_ID=asst-your-assistant-id-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Create an OpenAI Assistant:**
   - Go to [OpenAI Platform](https://platform.openai.com)
   - Navigate to Assistants section
   - Create a new assistant with instructions for resume analysis
   - Copy the Assistant ID to your `.env.local`

## OpenAI Assistant Setup

Create an assistant with these instructions:

```
You are a professional resume analyzer. When given a resume, provide a detailed analysis in JSON format with the following structure:

{
  "skillsAnalysis": {
    "technicalSkills": ["skill1", "skill2"],
    "softSkills": ["skill1", "skill2"],
    "skillsGaps": ["missing skill1", "missing skill2"],
    "overallScore": 85
  },
  "experienceAnalysis": {
    "yearsOfExperience": 5,
    "careerLevel": "Mid",
    "industryFit": "Technology",
    "keyAchievements": ["achievement1", "achievement2"]
  },
  "atsScore": {
    "score": 78,
    "maxScore": 100,
    "improvements": ["improvement1", "improvement2"],
    "keywordMatches": 15
  },
  "recommendations": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvementSuggestions": ["suggestion1", "suggestion2"],
    "nextSteps": ["step1", "step2"]
  },
  "formatting": {
    "readability": 85,
    "structure": 90,
    "consistency": 80,
    "professionalAppearance": 85
  },
  "contactInfo": {
    "hasEmail": true,
    "hasPhone": true,
    "hasLinkedIn": false,
    "hasPortfolio": false
  }
}

Always return valid JSON. Provide constructive, actionable feedback.
```

## Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm run start
   ```

## File Structure

```
check-my-resume-ai/
├── src/
│   ├── app/
│   │   ├── api/scan-resume/route.ts    # API endpoint for resume analysis
│   │   ├── layout.tsx                  # Root layout with SEO
│   │   └── page.tsx                    # Main application page
│   ├── components/
│   │   ├── FileUploader.tsx           # Drag-and-drop file upload
│   │   ├── Header.tsx                 # Application header
│   │   ├── LoadingSpinner.tsx         # Loading states
│   │   └── ResultsDisplay.tsx         # Analysis results display
│   ├── lib/
│   │   ├── openai.ts                  # OpenAI client configuration
│   │   └── utils.ts                   # Utility functions
│   └── types/
│       └── index.ts                   # TypeScript type definitions
├── .env.example                       # Environment variables template
├── .env.local                         # Your environment variables
└── package.json
```

## API Endpoints

### POST /api/scan-resume

Analyzes an uploaded resume file.

**Parameters:**
- `file`: Resume file (PDF, DOC, DOCX) - max 5MB

**Response:**
```json
{
  "success": true,
  "data": {
    "skillsAnalysis": { ... },
    "experienceAnalysis": { ... },
    "atsScore": { ... },
    "recommendations": { ... },
    "formatting": { ... },
    "contactInfo": { ... }
  }
}
```

## Features Overview

### File Upload
- Drag-and-drop interface
- Support for PDF, DOC, DOCX files
- File validation and error handling
- Progress indicators

### AI Analysis
- Comprehensive skills assessment
- ATS compatibility scoring
- Experience level evaluation
- Professional formatting review
- Actionable recommendations

### Results Display
- Interactive score visualizations
- Organized sections with clear metrics
- Download results as JSON
- Mobile-responsive design

## Security Features

- Rate limiting (5 requests per minute per IP)
- File type and size validation
- Input sanitization
- No file storage on server
- Environment variable protection

## License

This project is licensed under the MIT License.

---

**⚠️ Important**: Make sure to add your OpenAI API key and Assistant ID to `.env.local` before running the application. Never commit your `.env.local` file to version control.
