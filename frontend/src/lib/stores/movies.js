import { writable } from "svelte/store";
import { io } from "socket.io-client";

// Store for movies
export const movies = writable([]);

// Single Socket.IO instance
let socket;
let debug = false; // set true if you want logs

/**
 * Initialize Movie Socket
 */
export function initMovieSocket() {
    if (socket) return; // prevent multiple connections

    socket = io("http://localhost:8080", {
        withCredentials: true
    });

    if (debug) {
        socket.on("connect", () => console.log("Movie socket connected"));
        socket.on("disconnect", () => console.log("Movie socket disconnected"));
    }

    // Movie created
    socket.on("movie-created", (movie) => {
        movies.update(list =>
            list.some(m => m.id === movie.id) ? list : [...list, movie]
        );
    });

    // Movie deleted
    socket.on("movie-deleted", ({ id }) => {
        movies.update(list => list.filter(m => m.id !== id));
    });
}

/**
 * Optional emit helpers (only needed if you emit from frontend)
 */
export function createMovie(movieData) {
    socket?.emit("create-movie", movieData);
}


export function deleteMovie(movieId) {
    socket?.emit("delete-movie", { id: movieId });
}

/**
 * Optional: disconnect socket
 */
export function destroyMovieSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
