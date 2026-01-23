import { broadcast } from "../broadcast.js";

export function emitShowtimeCreated(showtime) {
    broadcast("showtime-created", showtime);
}

export function emitShowtimeDeleted(showtimeId) {
    broadcast("showtime-deleted", { id: showtimeId });
}