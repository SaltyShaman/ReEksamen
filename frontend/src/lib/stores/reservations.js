import { writable } from "svelte/store";
import { io } from "socket.io-client";

// Store for reservations
export const reservations = writable([]);

// Single Socket.IO instance
let socket;
let debug = false; // set true to enable logs

/**
 * Initialize Reservation Socket
 */
export function initReservationSocket() {
    if (socket) return; // prevent multiple connections

    socket = io("http://localhost:8080", {
        withCredentials: true
    });

    if (debug) {
        socket.on("connect", () =>
            console.log("Reservation socket connected")
        );
        socket.on("disconnect", () =>
            console.log("Reservation socket disconnected")
        );
    }

    // Reservation created
    socket.on("reservation-created", (reservation) => {
        reservations.update(list =>
            list.some(r => r.id === reservation.id)
                ? list
                : [...list, reservation]
        );
    });

    // Reservation updated
    socket.on("reservation-updated", (reservation) => {
        reservations.update(list =>
            list.map(r =>
                r.id === reservation.id ? reservation : r
            )
        );
    });

    // Reservation deleted
    socket.on("reservation-deleted", ({ id }) => {
        reservations.update(list =>
            list.filter(r => r.id !== id)
        );
    });
}

/**
 * Optional emit helpers (only if frontend emits events)
 */
export function deleteReservation(reservationId) {
    socket?.emit("delete-reservation", { id: reservationId });
}

/**
 * Optional: disconnect socket
 */
export function destroyReservationSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
