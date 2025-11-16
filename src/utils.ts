type FormatMode = 'long' | 'short';

/**
 * Formats a number to a string, removing unnecessary trailing zeros.
 * For example, 15.0 becomes "15" and 1.50 becomes "1.5".
 * @param num The number to format.
 * @param precision The number of decimal places to round to.
 * @returns A cleanly formatted string representation of the number.
 */
function formatDecimal(num: number, precision: number): string {
    const roundedNum = parseFloat(num.toFixed(precision));
    return roundedNum.toString();
}

/**
 * Dynamically converts seconds into a human-readable time string.
 *
 * @param seconds The total number of seconds to format.
 * @param mode The desired output format: 'long' for a detailed, adaptive string,
 *             or 'short' for a concise, adaptive unit (sec, min, or hr).
 * @returns A user-friendly, formatted time string.
 */
function formatDuration(seconds: number, mode: FormatMode): string {
    if (typeof seconds !== 'number' || seconds < 0) {
        return 'Invalid input';
    }

    // --- Long Mode ---
    if (mode === 'long') {
        if (seconds < 1) {
            return "0 seconds";
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.round(seconds % 60);

        const parts: string[] = [];
        if (hours > 0) {
            parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        }
        // Only show seconds if they are part of a smaller duration, or if they are the only unit.
        if (remainingSeconds > 0 && hours === 0) {
            parts.push(`${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`);
        }

        return parts.length > 0 ? parts.join(', ') : "0 seconds";
    }

    // --- Short Mode ---
    if (mode === 'short') {
        // Handle durations under a minute
        if (seconds < 60) {
            return `${Math.round(seconds)} sec`;
        }
        // Handle durations under an hour
        else if (seconds < 3600) {
            const totalMinutes = seconds / 60;
            const formattedMinutes = formatDecimal(totalMinutes, 1);
            return `${formattedMinutes} min`;
        }
        // Handle durations of one hour or more
        else {
            const totalHours = seconds / 3600;
            const formattedHours = formatDecimal(totalHours, 2);
            return `${formattedHours} hr`;
        }
    }

    return 'Invalid mode';
}


export { formatDuration };
