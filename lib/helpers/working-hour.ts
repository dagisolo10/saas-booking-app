import { BusinessHours, Weekday } from "../types";

export function getWeekday(bookingDate: string) {
    return new Date(bookingDate).toLocaleString("en-US", { weekday: "long" }).toLowerCase() as Weekday;
}

export function isBusinessOpen(businessHour: BusinessHours, weekDay: Weekday, bookingDate: string) {
    // check if business is open on that day
    if (businessHour[weekDay] === null) return false;

    const openAt = businessHour[weekDay]?.open;
    const closedAt = businessHour[weekDay]?.close;

    const hour = new Date(bookingDate).getUTCHours().toString().padStart(2, "0");
    const minute = new Date(bookingDate).getUTCMinutes().toString().padStart(2, "0");

    // get same format at working hours
    const bookingTime = `${hour}:${minute}`;

    // check if booking time is in between opening and closing time
    const inWorkingHours = bookingTime >= openAt && bookingTime < closedAt;

    return inWorkingHours;
}

export function hasEnoughTime(businessHour: BusinessHours, weekDay: Weekday, bookingDate: string, duration: number) {
    // get closing time
    const closedAt = businessHour[weekDay]?.close;

    if (!closedAt) return false;

    // get the closing hour and minute
    const closingHour = Number(closedAt?.split(":")[0]);
    const closingMinute = closingHour * 60 + Number(closedAt?.split(":")[1]);

    // get booking hour and minute
    const bookingHour = new Date(bookingDate).getUTCHours();
    const bookingMinute = bookingHour * 60 + new Date(bookingDate).getUTCMinutes();

    // the latest time the service can start

    return bookingMinute + duration <= closingMinute;
}
