"use client";

import LiquidGlass from "@/components/LiquidGlass";
import { cn } from "@/lib/utils";
import type { ResultsDisplayProps } from "@/types";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Eye,
  FileText,
  Key,
  RefreshCw,
  Target,
} from "lucide-react";
import React from "react";

export default function ResultsDisplay({
  analysis,
  onReset,
  className,
}: ResultsDisplayProps) {
  const getLabelColor = (
    label: "Low Performance" | "Medium Performance" | "High Performance",
  ) => {
    switch (label) {
      case "High Performance":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Medium Performance":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Low Performance":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400";
    }
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return "text-gray-400";
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const metricIcons = {
    keyword_coverage: Key,
    ats_compliance: FileText,
    job_match: Target,
    structure: FileText,
    ranking: BarChart3,
    readability: Eye,
    ghosted_risk_subscore_0_to_10: AlertTriangle,
  };

  const metricLabels = {
    keyword_coverage: "Keyword Coverage",
    ats_compliance: "ATS Compliance",
    job_match: "Job Match",
    structure: "Structure & Organization",
    ranking: "ATS Ranking Potential",
    readability: "Human Readability",
    ghosted_risk_subscore_0_to_10: "Ghosting Risk",
  };

  const metricColors = {
    keyword_coverage: "text-blue-600",
    ats_compliance: "text-green-600",
    job_match: "text-indigo-600",
    structure: "text-purple-600",
    ranking: "text-cyan-600",
    readability: "text-orange-600",
    ghosted_risk_subscore_0_to_10: "text-red-600",
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="text-center rounded-[1.6rem] border border-green-200 dark:border-green-800">
        <LiquidGlass
          className="dock-glass"
          padding="0rem"
          borderRadius="1.6rem"
          hoverPadding="0rem"
          hoverBorderRadius="1.6rem"
          noTint={true}
        >
          <div className="text-center w-[100%] space-y-6 p-8 rounded-3xl dark:bg-green-800/5">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Resume Analysis Complete
              </h2>
            </div>

            {/* Overall Score - Large and Prominent */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
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
                      analysis.overall.score_0_to_100 >= 70
                        ? "text-green-500"
                        : analysis.overall.score_0_to_100 >= 40
                          ? "text-yellow-500"
                          : "text-red-500",
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(analysis.overall.score_0_to_100)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    / 100
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div
                  className={cn(
                    "inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold",
                    getLabelColor(analysis.overall.label),
                  )}
                >
                  {analysis.overall.label}
                </div>
                {analysis.overall.summary && (
                  <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl text-left">
                    {analysis.overall.summary}
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
        </LiquidGlass>
      </div>

      {/* Score Breakdown */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          📊 Detailed Score Breakdown
        </h3>
        <div className="rounded-[1.6rem] border border-gray-200 dark:border-gray-700">
          <LiquidGlass
            className="dock-glass"
            padding="0rem"
            borderRadius="1.6rem"
            hoverPadding="0rem"
            hoverBorderRadius="1.6rem"
            noTint={false}
          >
            <div className="p-8 w-full rounded-[1.6rem] dark:bg-gray-800/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(
                  Object.keys(analysis.breakdown) as Array<
                    keyof typeof analysis.breakdown
                  >
                ).map((key) => {
                  const score = analysis.breakdown[key];
                  const Icon = metricIcons[key];
                  const label = metricLabels[key];
                  const color = metricColors[key];
                  const isGhostingRisk =
                    key === "ghosted_risk_subscore_0_to_10";

                  return (
                    <div
                      key={key}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className={cn("w-5 h-5", color)} />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {label}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-lg font-bold",
                            getScoreColor(score),
                          )}
                        >
                          {score !== null ? `${score.toFixed(1)}/10` : "N/A"}
                        </span>
                      </div>
                      {score !== null && (
                        <>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className={cn(
                                "h-2.5 rounded-full transition-all duration-1000",
                                score >= 8
                                  ? "bg-green-500"
                                  : score >= 6
                                    ? "bg-yellow-500"
                                    : "bg-red-500",
                              )}
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                          {isGhostingRisk && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                              Lower is Better
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ready to Land Your Dream Job?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Get personalized resume optimization and job search strategies that
            actually work.
          </p>
          <LiquidGlass
            className="dock-glass"
            padding="0rem"
            borderRadius="2.5rem"
            hoverPadding="0.2rem"
            hoverBorderRadius="2.5rem"
            noTint={false}
          >
            <button
              onClick={() => {
                window.open("http://Hackedcv.ai/moreinfo", "_blank");
              }}
              className="cta-button text-center"
            >
              Want to stop getting ignored? Click here
            </button>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
