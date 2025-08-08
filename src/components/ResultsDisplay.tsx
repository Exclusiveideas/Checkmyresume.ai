'use client';

import React from 'react';
import { 
  Download, 
  RefreshCw, 
  Star, 
  TrendingUp, 
  Award, 
  Target,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Linkedin,
  Globe
} from 'lucide-react';
import { ResultsDisplayProps } from '@/types';
import { cn, downloadAsJson } from '@/lib/utils';

export default function ResultsDisplay({ 
  analysis, 
  onReset, 
  onDownload, 
  className 
}: ResultsDisplayProps) {
  const handleDownloadJson = () => {
    downloadAsJson(analysis, 'resume-analysis');
  };

  const ScoreCircle = ({ score, label, color = "text-blue-600" }: { 
    score: number; 
    label: string; 
    color?: string; 
  }) => (
    <div className="text-center">
      <div className={cn("relative w-20 h-20 mx-auto mb-2", color)}>
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="opacity-20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2.51 * score} 251.2`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {score}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    </div>
  );

  const ContactIcon = ({ hasContact, icon: Icon, label }: {
    hasContact: boolean;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <div className="flex items-center space-x-2">
      {hasContact ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analysis Complete
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Your resume has been analyzed. Here are the detailed insights:
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* Overview Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <ScoreCircle 
          score={analysis.skillsAnalysis.overallScore} 
          label="Skills Score" 
          color="text-blue-600" 
        />
        <ScoreCircle 
          score={analysis.atsScore.score} 
          label="ATS Score" 
          color="text-purple-600" 
        />
        <ScoreCircle 
          score={analysis.formatting.readability} 
          label="Readability" 
          color="text-green-600" 
        />
        <ScoreCircle 
          score={analysis.formatting.professionalAppearance} 
          label="Professional" 
          color="text-indigo-600" 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Skills Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Skills Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skillsAnalysis.technicalSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skillsAnalysis.softSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {analysis.skillsAnalysis.skillsGaps.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Skills Gaps</h4>
                <ul className="space-y-1">
                  {analysis.skillsAnalysis.skillsGaps.map((gap, index) => (
                    <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
                      <Target className="w-3 h-3" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Experience Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Experience Analysis</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analysis.experienceAnalysis.yearsOfExperience}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{analysis.experienceAnalysis.careerLevel}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Career Level</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Industry Fit</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.experienceAnalysis.industryFit}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Achievements</h4>
            <ul className="space-y-1">
              {analysis.experienceAnalysis.keyAchievements.map((achievement, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                  <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ATS Score & Contact Info */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">ATS Optimization</h3>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {analysis.atsScore.score}/{analysis.atsScore.maxScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {analysis.atsScore.keywordMatches} keyword matches found
            </div>
          </div>

          {analysis.atsScore.improvements.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Improvements</h4>
              <ul className="space-y-1">
                {analysis.atsScore.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contact Information</h3>
          </div>
          
          <div className="space-y-3">
            <ContactIcon 
              hasContact={analysis.contactInfo.hasEmail} 
              icon={Mail} 
              label="Email Address" 
            />
            <ContactIcon 
              hasContact={analysis.contactInfo.hasPhone} 
              icon={Phone} 
              label="Phone Number" 
            />
            <ContactIcon 
              hasContact={analysis.contactInfo.hasLinkedIn} 
              icon={Linkedin} 
              label="LinkedIn Profile" 
            />
            <ContactIcon 
              hasContact={analysis.contactInfo.hasPortfolio} 
              icon={Globe} 
              label="Portfolio/Website" 
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <span>Recommendations</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Strengths</span>
            </h4>
            <ul className="space-y-2">
              {analysis.recommendations.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-green-200 dark:border-green-700">
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Areas for Improvement</span>
            </h4>
            <ul className="space-y-2">
              {analysis.recommendations.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-red-200 dark:border-red-700">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Next Steps</span>
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Improvement Suggestions</h5>
              <ul className="space-y-1">
                {analysis.recommendations.improvementSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Items</h5>
              <ul className="space-y-1">
                {analysis.recommendations.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}