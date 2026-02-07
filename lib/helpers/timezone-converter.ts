export default function getTimezoneOffset(timezone: string) {
    return new Intl.DateTimeFormat(undefined, { timeZone: timezone, timeZoneName: "shortOffset" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || "";
}
