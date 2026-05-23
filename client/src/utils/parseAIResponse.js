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
  
  let cleanText = rawText;
  
  // Remove markdown code blocks
  cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
  
  // Remove escape sequences from backticks
  cleanText = cleanText.replace(/\\`/g, '`');
  
  // Trim whitespace
  cleanText = cleanText.trim();
  
  // Find JSON array boundaries
  const startIdx = cleanText.indexOf('[');
  const lastIdx = cleanText.lastIndexOf(']');
  
  if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
    throw new Error('No valid JSON array found in response');
  }
  
  // Extract just the JSON array
  cleanText = cleanText.substring(startIdx, lastIdx + 1);
  
  // Fix common JSON issues
  cleanText = cleanText.replace(/\\n/g, ' ').replace(/\n/g, ' ');
  cleanText = cleanText.replace(/\\"/g, '"');
  cleanText = cleanText.replace(/\r/g, ' ');
  
  // Try to parse
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // If parsing still fails, try removing any remaining escape sequences
    cleanText = cleanText.replace(/\\/g, '');
    return JSON.parse(cleanText);
  }
};

/**
 * Parse JSON object from AI response
 * @param {string} rawText - Raw response text from AI API
 * @returns {Object} Parsed JSON object
 */
export const parseAIJsonObject = (rawText) => {
  if (!rawText) throw new Error('Empty response');
  
  let cleanText = rawText;
  
  // Remove markdown code blocks
  cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
  
  // Remove escape sequences from backticks
  cleanText = cleanText.replace(/\\`/g, '`');
  
  // Trim whitespace
  cleanText = cleanText.trim();
  
  // Find JSON object boundaries - look for first { and last }
  const startIdx = cleanText.indexOf('{');
  const lastIdx = cleanText.lastIndexOf('}');
  
  if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
    throw new Error('No valid JSON object found in response');
  }
  
  // Extract just the JSON object
  cleanText = cleanText.substring(startIdx, lastIdx + 1);
  
  // Fix common JSON issues
  cleanText = cleanText.replace(/\\n/g, ' ').replace(/\n/g, ' ');
  cleanText = cleanText.replace(/\\"/g, '"');
  cleanText = cleanText.replace(/\r/g, ' ');
  
  // Try to parse
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // If parsing still fails, try removing any remaining escape sequences
    cleanText = cleanText.replace(/\\/g, '');
    return JSON.parse(cleanText);
  }
};

export default {
  parseAIJsonArray,
  parseAIJsonObject
};
