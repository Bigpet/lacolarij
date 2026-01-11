/**
 * Utilities for working with Atlassian Document Format (ADF).
 */

interface AdfNode {
  type: string;
  text?: string;
  content?: AdfNode[];
}

/**
 * Extract plain text from an ADF document.
 * Recursively traverses the document tree to collect all text content.
 */
export function extractTextFromAdf(adf: unknown): string {
  if (!adf || typeof adf !== "object") return "";

  const doc = adf as AdfNode;

  // If this is a text node, return its text content
  if (doc.type === "text") {
    return doc.text || "";
  }

  // If this node has content, recursively extract text from children
  if (Array.isArray(doc.content)) {
    return doc.content
      .map((node) => extractTextFromAdf(node))
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

/**
 * Check if a value is a valid ADF document.
 */
export function isAdfDocument(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const doc = value as { type?: string; content?: unknown[] };
  return doc.type === "doc" && Array.isArray(doc.content);
}

/**
 * Convert plain text to a simple ADF document.
 */
export function textToAdf(text: string): object {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: text,
          },
        ],
      },
    ],
  };
}
