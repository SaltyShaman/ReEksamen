import { broadcast } from "../broadcast.js";

export function emitReservationCreated(reservation) {
    broadcast("reservation-created", reservation);
}

export function emitReservationUpdated(reservation) {
    broadcast("reservation-updated", reservation);
}

export function emitReservationDeleted(reservationId) {
    broadcast("reservation-deleted", { id: reservationId });
}