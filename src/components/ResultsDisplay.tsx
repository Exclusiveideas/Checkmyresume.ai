'use client';

import LiquidGlass from '@/components/LiquidGlass';
import { cn } from '@/lib/utils';
import { ResultsDisplayProps } from '@/types';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Key,
  RefreshCw,
  Target,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';

export default function ResultsDisplay({ 
  analysis, 
  onReset, 
  className 
}: ResultsDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };


  const ScoreCircle = ({ score, total = 10, label, color = "text-blue-600" }: { 
    score: number; 
    total?: number;
    label: string; 
    color?: string; 
  }) => {
    const percentage = (score / total) * 100;
    return (
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
              strokeDasharray={`${2.51 * percentage} 251.2`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {score.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      </div>
    );
  };

  const ExpandableSection = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="p-6 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );

  const getLabelColor = (label: 'Low' | 'Medium' | 'High') => {
    switch (label) {
      case 'High': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Low': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-6 p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Resume Analysis Complete
          </h2>
        </div>
        
        {/* Overall Score - Large and Prominent */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2.51 * analysis.overall.score_0_to_100} 251.2`}
                className={cn(
                  "transition-all duration-1000 ease-out",
                  analysis.overall.score_0_to_100 >= 70 ? "text-green-500" :
                  analysis.overall.score_0_to_100 >= 40 ? "text-yellow-500" : "text-red-500"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(analysis.overall.score_0_to_100)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">/ 100</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold",
              getLabelColor(analysis.overall.final_label)
            )}>
              {analysis.overall.final_label} Performance
            </div>
            {analysis.overall.rationale && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                {analysis.overall.rationale}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onReset}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* What This Means */}
      {analysis.what_this_means && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What This Means
              </h3>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                {analysis.what_this_means}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          🔍 Detailed Breakdown
        </h3>
        <div className="space-y-6">
          {/* Keyword Coverage */}
          <ExpandableSection 
            title={`🔑 Keyword Coverage (${analysis.breakdown.keyword_coverage.score}/10)`}
            icon={Key}
            sectionKey="keyword_coverage"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score</span>
                <ScoreCircle 
                  score={analysis.breakdown.keyword_coverage.score}
                  label="Keywords"
                  color="text-blue-600"
                />
              </div>
              {analysis.breakdown.keyword_coverage.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.keyword_coverage.rationale}
                  </p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">
                    Keywords Found ({analysis.breakdown.keyword_coverage.keywords_found_count})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.breakdown.keyword_coverage.keywords_found.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                {analysis.breakdown.keyword_coverage.missing_keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.breakdown.keyword_coverage.missing_keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ExpandableSection>

          {/* Organization Structure */}
          <ExpandableSection 
            title={`📐 Organization & Structure (${analysis.breakdown.organization_structure.score}/10)`}
            icon={FileText}
            sectionKey="organization_structure"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score</span>
                <ScoreCircle 
                  score={analysis.breakdown.organization_structure.score}
                  label="Structure"
                  color="text-purple-600"
                />
              </div>
              {analysis.breakdown.organization_structure.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.organization_structure.rationale}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(analysis.breakdown.organization_structure.checks).map(([check, passed]) => (
                  <div key={check} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {check.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ExpandableSection>

          {/* ATS Compliance */}
          <ExpandableSection 
            title={`🛡️ ATS Compliance (${analysis.breakdown.ats_compliance.score}/10)`}
            icon={Bot}
            sectionKey="ats_compliance"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score</span>
                <ScoreCircle 
                  score={analysis.breakdown.ats_compliance.score}
                  label="ATS Ready"
                  color="text-green-600"
                />
              </div>
              {analysis.breakdown.ats_compliance.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.ats_compliance.rationale}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Violations Found</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    analysis.breakdown.ats_compliance.violations_count === 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {analysis.breakdown.ats_compliance.violations_count}
                  </span>
                </div>
                {analysis.breakdown.ats_compliance.violations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Issues Found</h4>
                    <div className="space-y-2">
                      {analysis.breakdown.ats_compliance.violations.map((violation, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-red-700 dark:text-red-300">
                          <XCircle className="w-4 h-4" />
                          <span className="capitalize">{violation.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ExpandableSection>

          {/* Readability (Human Scan) */}
          <ExpandableSection 
            title={`👁️ Readability (Human Scan) (${analysis.breakdown.readability.score}/10)`}
            icon={Eye}
            sectionKey="readability"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score</span>
                <ScoreCircle 
                  score={analysis.breakdown.readability.score}
                  label="Readable"
                  color="text-orange-600"
                />
              </div>
              {analysis.breakdown.readability.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.readability.rationale}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{analysis.breakdown.readability.metrics_examples_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Metrics/Examples</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{analysis.breakdown.readability.action_verbs_examples_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Action Verbs</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Buzzword Stuffing</span>
                  <div className="flex items-center space-x-2">
                    {analysis.breakdown.readability.buzzword_stuffing_detected ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-sm">
                      {analysis.breakdown.readability.buzzword_stuffing_detected ? 'Detected' : 'Not Detected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Job Match */}
          <ExpandableSection 
            title={`🎯 Job Match Likelihood (${analysis.breakdown.job_match.score}/10)`}
            icon={Target}
            sectionKey="job_match"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score</span>
                <ScoreCircle 
                  score={analysis.breakdown.job_match.score}
                  label="Job Match"
                  color="text-indigo-600"
                />
              </div>
              {analysis.breakdown.job_match.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.job_match.rationale}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Alignment Factors</h4>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(analysis.breakdown.job_match.alignment_factors).map(([factor, aligned]) => (
                    <div key={factor} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {aligned ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {factor.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Ghosted Risk Score */}
          <ExpandableSection 
            title={`👻 Ghosted Risk Score (${analysis.breakdown.ghosted_risk.percent}%)`}
            icon={AlertTriangle}
            sectionKey="ghosted_risk"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Risk Level</span>
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold mb-1",
                    analysis.breakdown.ghosted_risk.percent <= 30 ? "text-green-600" :
                    analysis.breakdown.ghosted_risk.percent <= 60 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {analysis.breakdown.ghosted_risk.percent}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risk</p>
                </div>
              </div>
              {analysis.breakdown.ghosted_risk.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.ghosted_risk.rationale}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Risk Components</h4>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(analysis.breakdown.ghosted_risk.components).map(([component, present]) => (
                    <div key={component} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {present ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {component.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* ATS Ranking */}
          <ExpandableSection 
            title={`📊 ATS Ranking (${analysis.breakdown.ats_ranking.score}/10)`}
            icon={BarChart3}
            sectionKey="ats_ranking"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score</span>
                <ScoreCircle 
                  score={analysis.breakdown.ats_ranking.score}
                  label="Ranking"
                  color="text-cyan-600"
                />
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold",
                  getLabelColor(analysis.breakdown.ats_ranking.label)
                )}>
                  {analysis.breakdown.ats_ranking.label} Likelihood
                </div>
              </div>
              {analysis.breakdown.ats_ranking.rationale && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.breakdown.ats_ranking.rationale}
                  </p>
                </div>
              )}
            </div>
          </ExpandableSection>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          💡 Recommendations
        </h3>
        <div className="space-y-4">
          {analysis.recommendations
            .sort((a, b) => {
              const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((recommendation, index) => (
              <div key={index} className={cn(
                "border-l-4 p-4 rounded-lg",
                getPriorityColor(recommendation.priority)
              )}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      recommendation.priority === 'high' ? 'bg-red-500' :
                      recommendation.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    )}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {recommendation.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {recommendation.description}
                    </p>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide",
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  )}>
                    {recommendation.priority}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ready to Land Your Dream Job?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Get personalized resume optimization and job search strategies that actually work.
          </p>
        <LiquidGlass 
          className="dock-glass"
          padding="0rem"
          borderRadius="2.5rem"
          hoverPadding="0.2rem"
          hoverBorderRadius="2.5rem"
        >
          <button
            onClick={() => {
              alert('Landing Page link coming soon');
            }}
            className="cta-button"
          >
            Want to stop getting ignored? Click here
          </button>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}