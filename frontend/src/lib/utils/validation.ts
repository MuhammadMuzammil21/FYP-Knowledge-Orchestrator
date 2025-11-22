import { APP_CONFIG } from '../../../src/config/constants';

/**
 * Validate uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!APP_CONFIG.allowedFileTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${APP_CONFIG.allowedFileTypes.join(', ')}`,
    };
  }

  // Check MIME type
  if (!APP_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload an audio file.',
    };
  }

  // Check file size
  if (file.size > APP_CONFIG.maxFileSize) {
    const maxSizeMB = APP_CONFIG.maxFileSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit.`,
    };
  }

  return { valid: true };
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(value: string): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): { valid: boolean; error?: string } {
  if (isEmpty(query)) {
    return {
      valid: false,
      error: 'Search query cannot be empty',
    };
  }

  if (query.length < 2) {
    return {
      valid: false,
      error: 'Search query must be at least 2 characters',
    };
  }

  if (query.length > 100) {
    return {
      valid: false,
      error: 'Search query is too long',
    };
  }

  return { valid: true };
}