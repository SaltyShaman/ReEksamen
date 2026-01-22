import { broadcast } from "../broadcast.js";



export function emitSeatUpdated(seat) {
    broadcast("seat-updated", seat);
}

