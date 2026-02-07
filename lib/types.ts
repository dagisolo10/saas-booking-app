export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type BusinessHours = Record<Weekday, { open: string; close: string } | null>;

export interface Service {
    id: string;
    name: string;
    duration: number;
    category: string;
    price: number;
    rating: number;
    businessId: string;
    thumbnail?: string;
}
