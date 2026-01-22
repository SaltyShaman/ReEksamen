import { writable } from "svelte/store";
import { io } from "socket.io-client";

// Seats grouped by hallId
// {
//   [hallId]: [ { id, seat_number, status } ]
// }
export const seats = writable({});

// Single Socket.IO instance
let socket;
let debug = false; // set true for logs

/**
 * Initialize seat socket and listeners
 */
export function initSeatSocket() {
    if (socket) return;

    socket = io("http://localhost:8080", {
        withCredentials: true
    });

    if (debug) {
        socket.on("connect", () => console.log("Seat socket connected"));
        socket.on("disconnect", () => console.log("Seat socket disconnected"));
    }

    /**
     * Seat updated (status change, etc.)
     */
    socket.on("seat-updated", (updatedSeat) => {
        seats.update(allSeats => {
            const hallSeats = allSeats[updatedSeat.hall_id];
            if (!hallSeats) return allSeats;

            return {
                ...allSeats,
                [updatedSeat.hall_id]: hallSeats.map(seat =>
                    seat.id === updatedSeat.id ? updatedSeat : seat
                )
            };
        });
    });
}

/**
 * Load all seats for a hall (HTTP)
 */
export async function loadSeatsForHall(hallId) {
    const res = await fetch(
        `http://localhost:8080/seats/halls/${hallId}/seats`,
        { credentials: "include" }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load seats");

    seats.update(all => ({ ...all, [hallId]: data.seats }));
    return data.seats;
}

export async function loadSeat(hallId, seatNumber) {
  const res = await fetch(
    `http://localhost:8080/seats/halls/${hallId}/seats/${seatNumber}`,
    { credentials: "include" }
  );

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to load seat");

  return data.seat; // now returns {id, hall_id, seat_number, status}
}


/**
 * Clear seats for a hall (optional cleanup)
 */
export function clearSeatsForHall(hallId) {
    seats.update(all => {
        const copy = { ...all };
        delete copy[hallId];
        return copy;
    });
}

/**
 * Disconnect seat socket
 */
export function destroySeatSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
