/**
 * Date Utility Functions
 *
 * Handles conversion of UTC timestamps from the backend to the browser's local timezone.
 * All timestamps from the API are assumed to be in UTC.
 */

/**
 * Ensures a date string is treated as UTC if it doesn't have a timezone indicator.
 */
function ensureUTCDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  if (!date) return new Date();
  
  // If the string doesn't end with Z or a timezone offset (e.g. +05:00 or -0400), append Z
  // This is critical because naive ISO strings (without Z) are parsed as LOCAL by browsers.
  // We check for Z at the end, or a +/- followed by 2 or 4 digits at the end.
  const hasTimezone = /[Z]$|[+-]\d{2}(?::?\d{2})?$/.test(date);
  const utcStr = hasTimezone ? date : `${date}Z`;
  return new Date(utcStr);
}

/**
 * Formats a date string or Date object to a localized date string
 * @param date - UTC date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string in browser's local timezone
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const dateObj = ensureUTCDate(date);
  return dateObj.toLocaleDateString(undefined, options);
}

/**
 * Formats a date string or Date object to a localized time string
 * @param date - UTC date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted time string in browser's local timezone
 */
export function formatTime(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const dateObj = ensureUTCDate(date);
  return dateObj.toLocaleTimeString(undefined, options);
}

/**
 * Formats a date string or Date object to a localized date and time string
 * @param date - UTC date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date and time string in browser's local timezone
 */
export function formatDateTime(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const dateObj = ensureUTCDate(date);
  return dateObj.toLocaleString(undefined, options);
}

/**
 * Formats a date string or Date object to a short localized time string (HH:MM)
 * @param date - UTC date string or Date object
 * @returns Formatted time string in browser's local timezone
 */
export function formatShortTime(date: string | Date): string {
  return formatTime(date, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats a date string or Date object to a long localized date string
 * @param date - UTC date string or Date object
 * @returns Formatted date string in browser's local timezone
 */
export function formatLongDate(date: string | Date): string {
  return formatDate(date, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a UTC date string to a Date object
 * This is useful when you need to work with the Date object directly
 * @param utcDateString - UTC date string from the API
 * @returns Date object
 */
export function parseUTCDate(utcDateString: string): Date {
  return ensureUTCDate(utcDateString);
}
