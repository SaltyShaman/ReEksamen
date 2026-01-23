import { writable } from "svelte/store";
import { io } from "socket.io-client";

// List of showtimes
export const showtimes = writable([]);

// Single Socket.IO instance
let socket;
let debug = false;

export function initShowtimeSocket() {
    if (socket) return;

    socket = io("http://localhost:8080", { withCredentials: true });

    if (debug) {
        socket.on("connect", () => console.log("Showtime socket connected"));
        socket.on("disconnect", () => console.log("Showtime socket disconnected"));
    }

    // Real-time events
    socket.on("showtime-created", (s) => {
        showtimes.update(list => [...list, s]);
    });

    socket.on("showtime-deleted", ({ id }) => {
        showtimes.update(list => list.filter(s => s.showtime_id !== id));
    });
}

/**
 * Optional helper for fetching showtimes from backend
 */
export async function loadShowtimes(movieTitle = "") {
    try {
        const url = movieTitle
            ? `http://localhost:8080/showtimes/by-movie?title=${encodeURIComponent(movieTitle)}`
            : "http://localhost:8080/showtimes";
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load showtimes");
        showtimes.set(data.showtimes);
    } catch (err) {
        console.error(err);
        showtimes.set([]);
    }
}
