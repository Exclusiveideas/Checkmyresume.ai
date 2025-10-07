import { describe, expect, test } from "vitest";

// Helper functions extracted for testing
// These are currently inline in ResultsDisplay.tsx but should be testable

/**
 * Gets the appropriate color classes for a performance label
 * @param label - The performance level label
 * @returns Tailwind CSS classes for the label styling
 */
function getLabelColor(
  label: "Low Performance" | "Medium Performance" | "High Performance",
): string {
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
}

/**
 * Gets the appropriate color class for a score value
 * @param score - The numeric score (0-10) or null
 * @returns Tailwind CSS color class
 */
function getScoreColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-600";
}

describe("getLabelColor", () => {
  test("returns green colors for High Performance", () => {
    const result = getLabelColor("High Performance");
    expect(result).toBe(
      "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400",
    );
  });

  test("returns yellow colors for Medium Performance", () => {
    const result = getLabelColor("Medium Performance");
    expect(result).toBe(
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400",
    );
  });

  test("returns red colors for Low Performance", () => {
    const result = getLabelColor("Low Performance");
    expect(result).toBe(
      "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400",
    );
  });

  test("returns gray colors for invalid input (default case)", () => {
    // Testing the default case by casting to the union type with an invalid value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getLabelColor("Invalid" as any);
    expect(result).toBe(
      "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400",
    );
  });
});

describe("getScoreColor", () => {
  test("returns gray for null score", () => {
    expect(getScoreColor(null)).toBe("text-gray-400");
  });

  test("returns green for scores >= 8", () => {
    expect(getScoreColor(8)).toBe("text-green-600");
    expect(getScoreColor(8.5)).toBe("text-green-600");
    expect(getScoreColor(10)).toBe("text-green-600");
  });

  test("returns yellow for scores >= 6 and < 8", () => {
    expect(getScoreColor(6)).toBe("text-yellow-600");
    expect(getScoreColor(7)).toBe("text-yellow-600");
    expect(getScoreColor(7.9)).toBe("text-yellow-600");
  });

  test("returns red for scores < 6", () => {
    expect(getScoreColor(0)).toBe("text-red-600");
    expect(getScoreColor(3)).toBe("text-red-600");
    expect(getScoreColor(5.9)).toBe("text-red-600");
  });

  test("handles boundary values correctly", () => {
    expect(getScoreColor(5.99)).toBe("text-red-600");
    expect(getScoreColor(6.0)).toBe("text-yellow-600");
    expect(getScoreColor(7.99)).toBe("text-yellow-600");
    expect(getScoreColor(8.0)).toBe("text-green-600");
  });
});
