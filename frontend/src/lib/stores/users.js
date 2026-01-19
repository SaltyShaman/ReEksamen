import { writable } from "svelte/store";
import { io } from "socket.io-client";

// Store for the list of users
export const users = writable([]);

// Single Socket.IO instance
let socket;

/**
 * Initialize the Socket.IO connection and event listeners
 */
export function initUserSocket() {
    if (socket) return; // prevent multiple connections

    socket = io("http://localhost:8080", {
        withCredentials: true // use cookies if needed for sessions
    });

    socket.on("connect", () => console.log("User socket connected"));

    // Listen for user CRUD events from backend
    socket.on("user-created", (user) => {
        users.update(list => [...list, user]);
    });



    socket.on("disconnect", () => console.log("User socket disconnected"));
}

/**
 * Optional helper functions to emit events to backend if needed
 */

export function createUser(userData) {
    socket.emit("create-user", userData);
}


