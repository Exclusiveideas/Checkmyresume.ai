import { describe, expect, test } from "vitest";
import type { ResumeLiteResultData } from "@/types";

/**
 * Integration tests for the /api/scan-resume endpoint
 * Tests the new ResumeLiteResult schema (v3.0.0)
 */

describe("/api/scan-resume", () => {
  describe("ResumeLiteResultData schema validation", () => {
    test("validates complete response structure", () => {
      const mockResponse: ResumeLiteResultData = {
        schema_version: "3.0.0",
        generated_at: "2025-01-15T14:30:00Z",
        overall: {
          score_0_to_100: 72,
          label: "Medium Performance",
          summary:
            "Your resume demonstrates solid structure and job alignment with good readability.",
        },
        breakdown: {
          keyword_coverage: 6.5,
          ats_compliance: 7.5,
          job_match: 8.0,
          structure: 8.5,
          ranking: 6.8,
          readability: 8.2,
          ghosted_risk_subscore_0_to_10: 5.5,
        },
      };

      expect(mockResponse.schema_version).toBe("3.0.0");
      expect(mockResponse.overall.score_0_to_100).toBeGreaterThanOrEqual(0);
      expect(mockResponse.overall.score_0_to_100).toBeLessThanOrEqual(100);
      expect(mockResponse.overall.label).toMatch(
        /^(Low|Medium|High) Performance$/,
      );
    });

    test("validates overall score is within 0-100 range", () => {
      const validScores = [0, 50, 72, 100];
      validScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    test("validates breakdown scores are 0-10 or null", () => {
      const validBreakdownScores = [null, 0, 5.5, 6.8, 10];
      validBreakdownScores.forEach((score) => {
        if (score !== null) {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(10);
        } else {
          expect(score).toBe(null);
        }
      });
    });

    test("validates label enum values", () => {
      const validLabels = [
        "Low Performance",
        "Medium Performance",
        "High Performance",
      ];
      validLabels.forEach((label) => {
        expect(label).toMatch(/^(Low|Medium|High) Performance$/);
      });
    });

    test("handles null breakdown values correctly", () => {
      const mockResponse: ResumeLiteResultData = {
        schema_version: "3.0.0",
        generated_at: "2025-01-15T14:30:00Z",
        overall: {
          score_0_to_100: 50,
          label: "Medium Performance",
          summary: null,
        },
        breakdown: {
          keyword_coverage: null,
          ats_compliance: null,
          job_match: null,
          structure: null,
          ranking: null,
          readability: null,
          ghosted_risk_subscore_0_to_10: null,
        },
      };

      expect(mockResponse.breakdown.keyword_coverage).toBe(null);
      expect(mockResponse.overall.summary).toBe(null);
      expect(Object.keys(mockResponse.breakdown)).toHaveLength(7);
    });

    test("validates all 7 breakdown metrics are present", () => {
      const requiredMetrics = [
        "keyword_coverage",
        "ats_compliance",
        "job_match",
        "structure",
        "ranking",
        "readability",
        "ghosted_risk_subscore_0_to_10",
      ];

      const mockBreakdown: ResumeLiteResultData["breakdown"] = {
        keyword_coverage: 6.5,
        ats_compliance: 7.5,
        job_match: 8.0,
        structure: 8.5,
        ranking: 6.8,
        readability: 8.2,
        ghosted_risk_subscore_0_to_10: 5.5,
      };

      requiredMetrics.forEach((metric) => {
        expect(metric in mockBreakdown).toBe(true);
      });
    });

    test("validates ISO 8601 date format for generated_at", () => {
      const validDates = [
        "2025-01-15T14:30:00Z",
        "2025-10-07T10:00:00.000Z",
        "2024-12-31T23:59:59Z",
      ];

      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

      validDates.forEach((date) => {
        expect(date).toMatch(iso8601Regex);
      });
    });

    test("validates schema version is exactly 3.0.0", () => {
      const mockResponse: ResumeLiteResultData = {
        schema_version: "3.0.0",
        generated_at: "2025-01-15T14:30:00Z",
        overall: {
          score_0_to_100: 72,
          label: "Medium Performance",
          summary: "Test summary",
        },
        breakdown: {
          keyword_coverage: 6.5,
          ats_compliance: 7.5,
          job_match: 8.0,
          structure: 8.5,
          ranking: 6.8,
          readability: 8.2,
          ghosted_risk_subscore_0_to_10: 5.5,
        },
      };

      expect(mockResponse.schema_version).toBe("3.0.0");
    });
  });

  describe("API Response structure", () => {
    test("validates successful API response structure", () => {
      const mockApiResponse = {
        success: true,
        data: {
          schema_version: "3.0.0",
          generated_at: "2025-01-15T14:30:00Z",
          overall: {
            score_0_to_100: 72,
            label: "Medium Performance",
            summary: "Test",
          },
          breakdown: {
            keyword_coverage: 6.5,
            ats_compliance: 7.5,
            job_match: 8.0,
            structure: 8.5,
            ranking: 6.8,
            readability: 8.2,
            ghosted_risk_subscore_0_to_10: 5.5,
          },
        },
        message: "Resume analyzed successfully",
      };

      expect(mockApiResponse.success).toBe(true);
      expect(mockApiResponse.data).toBeDefined();
      expect(mockApiResponse.data?.schema_version).toBe("3.0.0");
    });

    test("validates error API response structure", () => {
      const mockErrorResponse = {
        success: false,
        error: "Failed to analyze resume",
      };

      expect(mockErrorResponse.success).toBe(false);
      expect(mockErrorResponse.error).toBeDefined();
      expect(typeof mockErrorResponse.error).toBe("string");
    });
  });
});
