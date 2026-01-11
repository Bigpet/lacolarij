import { describe, it, expect } from 'vitest';
import { extractTextFromAdf, isAdfDocument, textToAdf } from './adf';

describe('extractTextFromAdf', () => {
  it('returns empty string for null/undefined', () => {
    expect(extractTextFromAdf(null)).toBe('');
    expect(extractTextFromAdf(undefined)).toBe('');
  });

  it('returns empty string for non-objects', () => {
    expect(extractTextFromAdf('string')).toBe('');
    expect(extractTextFromAdf(123)).toBe('');
    expect(extractTextFromAdf(true)).toBe('');
  });

  it('extracts text from a simple text node', () => {
    const node = { type: 'text', text: 'Hello world' };
    expect(extractTextFromAdf(node)).toBe('Hello world');
  });

  it('extracts text from a paragraph with text', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };
    expect(extractTextFromAdf(doc)).toBe('Hello');
  });

  it('extracts text from multiple paragraphs', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'First' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Second' }],
        },
      ],
    };
    expect(extractTextFromAdf(doc)).toBe('First Second');
  });

  it('extracts text from nested content', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello' },
            { type: 'strong', content: [{ type: 'text', text: 'bold' }] },
            { type: 'text', text: 'world' },
          ],
        },
      ],
    };
    // Implementation joins with spaces between elements
    expect(extractTextFromAdf(doc)).toBe('Hello bold world');
  });

  it('handles empty content arrays', () => {
    const doc = { type: 'doc', content: [] };
    expect(extractTextFromAdf(doc)).toBe('');
  });

  it('handles missing text in text nodes', () => {
    const node = { type: 'text' };
    expect(extractTextFromAdf(node)).toBe('');
  });
});

describe('isAdfDocument', () => {
  it('returns false for null/undefined', () => {
    expect(isAdfDocument(null)).toBe(false);
    expect(isAdfDocument(undefined)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isAdfDocument('string')).toBe(false);
    expect(isAdfDocument(123)).toBe(false);
  });

  it('returns false for objects without doc type', () => {
    expect(isAdfDocument({ type: 'paragraph' })).toBe(false);
    expect(isAdfDocument({ type: 'text' })).toBe(false);
  });

  it('returns false for doc without content array', () => {
    expect(isAdfDocument({ type: 'doc' })).toBe(false);
    expect(isAdfDocument({ type: 'doc', content: 'not array' })).toBe(false);
  });

  it('returns true for valid ADF document', () => {
    expect(isAdfDocument({ type: 'doc', content: [] })).toBe(true);
    expect(
      isAdfDocument({
        type: 'doc',
        content: [{ type: 'paragraph' }],
      })
    ).toBe(true);
  });
});

describe('textToAdf', () => {
  it('creates a valid ADF document from text', () => {
    const result = textToAdf('Hello world');

    expect(result).toEqual({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello world',
            },
          ],
        },
      ],
    });
  });

  it('creates ADF that passes isAdfDocument check', () => {
    const result = textToAdf('Test');
    expect(isAdfDocument(result)).toBe(true);
  });

  it('creates ADF that can be extracted back to text', () => {
    const original = 'Test content';
    const adf = textToAdf(original);
    expect(extractTextFromAdf(adf)).toBe(original);
  });

  it('handles empty string', () => {
    const result = textToAdf('');
    expect(isAdfDocument(result)).toBe(true);
    expect(extractTextFromAdf(result)).toBe('');
  });
});
