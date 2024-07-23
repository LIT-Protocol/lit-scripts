/**
 * Gets a value from the cache or prompts the user if not found.
 * @param {string} cacheKey - The key to use for storing/retrieving the value
 * @param {string} promptMessage - The message to show when prompting for the value
 * @returns {string | null} The cached value, or null if not provided
 */
export function getCachedValue(
  cacheKey: string,
  promptMessage: string
): string | null {
  let value = localStorage.getItem(cacheKey);
  if (!value) {
    value = prompt(promptMessage);
    if (value) {
      localStorage.setItem(cacheKey, value);
    }
  }
  return value;
}
