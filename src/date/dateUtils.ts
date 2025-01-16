/**
 * Formats a date as a time string.
 * @param date The `Date` object to format.
 * @param locale The locale for formatting. Defaults to "en-US".
 * @param options Additional time formatting options.
 * @returns The formatted time string.
 * @example
 * DateFormatter.formatTime(new Date("2024-12-03T10:30:00"), "en-US", { hour: "2-digit", minute: "2-digit" });
 * // Output: "10:30 AM"
 */
export function formatDateTime(
    date: Date,
    locale = "en-US",
    options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "numeric", second: "numeric" }
): string {
    return new Intl.DateTimeFormat(locale, options).format(date);
}