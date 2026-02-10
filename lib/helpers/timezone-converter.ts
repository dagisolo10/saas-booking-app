export default function getTimezoneOffset(timezone: string) {
    const now = new Date();

    const toUtcMillis = (parts: Intl.DateTimeFormatPart[]) => {
        const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
        return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    };

    const base = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false } as const;
    const tzParts = new Intl.DateTimeFormat(undefined, { timeZone: timezone, ...base }).formatToParts(now);
    const utcParts = new Intl.DateTimeFormat(undefined, { timeZone: "UTC", ...base }).formatToParts(now);

    const diffInMinutes = Math.round((toUtcMillis(tzParts) - toUtcMillis(utcParts)) / 60_000);
    const sign = diffInMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(diffInMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    const mm = minutes ? `:${String(minutes).padStart(2, "0")}` : "";

    return `GMT${sign}${String(hours)}${mm}`;
}
