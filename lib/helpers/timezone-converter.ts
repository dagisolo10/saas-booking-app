export default function getTimezoneOffset(timezone: string) {
    const now = new Date();

    const tzTime = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        minute: "numeric",
        hour: "numeric",
        second: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour12: false,
    }).format(now);

    const utcTime = new Intl.DateTimeFormat(undefined, {
        timeZone: "UTC",
        minute: "numeric",
        hour: "numeric",
        second: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour12: false,
    }).format(now);

    const dateTz = new Date(tzTime);
    const dateUtc = new Date(utcTime);

    const diffInMinutes = Math.round((dateTz.getTime() - dateUtc.getTime()) / 60_000);
    const hours = Math.floor(Math.abs(diffInMinutes) / 60);
    const sign = diffInMinutes >= 0 ? "+" : "-";

    return `GMT${sign}${hours}`;
}
