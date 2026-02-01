export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type BusinessHours = Record<Weekday, { open: string; close: string } | null>;
