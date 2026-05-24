/**
 * Robustly parse JSON responses from AI APIs
 * Handles escaped characters, markdown code blocks, and malformed JSON
 */

/**
 * Parse JSON array from AI response
 * @param {string} rawText - Raw response text from AI API
 * @returns {Array} Parsed JSON array
 */
export const parseAIJsonArray = (rawText) => {
  if (!rawText) throw new Error('Empty response');
  
  let cleanText = rawText.trim();
  
  // Find JSON array boundaries
  const startIdx = cleanText.indexOf('[');
  const lastIdx = cleanText.lastIndexOf(']');
  
  if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
    throw new Error('No valid JSON array found in response');
  }
  
  const jsonCandidate = cleanText.substring(startIdx, lastIdx + 1);
  
  // Try parsing the raw candidate first. If it is valid, return it!
  try {
    return JSON.parse(jsonCandidate);
  } catch (e) {
    // Fall back to cleaning
  }
  
  let cleaned = jsonCandidate;
  
  // Remove markdown code blocks if they are inside
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
  
  // Fix newlines and carriage returns
  cleaned = cleaned.replace(/\r?\n/g, ' ');
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fix trailing commas
    cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      throw new Error(`Failed to parse AI JSON: ${e2.message}. Raw text: ${rawText}`);
    }
  }
};

/**
 * Parse JSON object from AI response
 * @param {string} rawText - Raw response text from AI API
 * @returns {Object} Parsed JSON object
 */
export const parseAIJsonObject = (rawText) => {
  if (!rawText) throw new Error('Empty response');
  
  let cleanText = rawText.trim();
  
  // Find JSON object boundaries - look for first { and last }
  const startIdx = cleanText.indexOf('{');
  const lastIdx = cleanText.lastIndexOf('}');
  
  if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
    throw new Error('No valid JSON object found in response');
  }
  
  const jsonCandidate = cleanText.substring(startIdx, lastIdx + 1);
  
  // Try parsing the raw candidate first. If it is valid, return it!
  try {
    return JSON.parse(jsonCandidate);
  } catch (e) {
    // Fall back to cleaning
  }
  
  let cleaned = jsonCandidate;
  
  // Remove markdown code blocks if they are inside
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
  
  // Fix newlines and carriage returns
  cleaned = cleaned.replace(/\r?\n/g, ' ');
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fix trailing commas
    cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      throw new Error(`Failed to parse AI JSON: ${e2.message}. Raw text: ${rawText}`);
    }
  }
};

export default {
  parseAIJsonArray,
  parseAIJsonObject
};
