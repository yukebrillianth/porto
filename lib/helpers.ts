/**
 * Delay execution for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a date to a localized string
 * @param date - Date to format
 * @param locale - Locale string (default: 'id-ID')
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'id-ID',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'id-ID'
): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize each word in a string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
}

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to append (default: '...')
 */
export function truncate(
  str: string,
  length: number,
  suffix: string = '...'
): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Format a number to currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'IDR')
 * @param locale - Locale string (default: 'id-ID')
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number, locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Generate a random string of specified length
 */
export function randomString(length: number = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Check if we're running on the server
 */
export const isServer = typeof window === 'undefined';

/**
 * Check if we're running on the client
 */
export const isClient = typeof window !== 'undefined';
