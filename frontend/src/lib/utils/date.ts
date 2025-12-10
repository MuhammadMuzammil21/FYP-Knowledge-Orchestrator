/**
 * Date Utility Functions
 * 
 * Handles conversion of UTC timestamps from the backend to the browser's local timezone.
 * All timestamps from the API are assumed to be in UTC.
 */

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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', options);
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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', options);
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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', options);
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
    return new Date(utcDateString);
}
