import { writable } from "svelte/store";
import { io } from "socket.io-client";

// Store for the list of users
export const users = writable([]);

// Single Socket.IO instance
let socket;
let debug = false; // set to true if you want console logs

/**
 * Initialize the Socket.IO connection and event listeners
 */
export function initUserSocket() {
    if (socket) return; // prevent multiple connections

    socket = io("http://localhost:8080", {
        withCredentials: true // allows cookies/session
    });

    if (debug) {
        socket.on("connect", () => console.log("User socket connected"));
        socket.on("disconnect", () => console.log("User socket disconnected"));
    }

    // New user created
    socket.on("user-created", (user) => {
        users.update(list => list.some(u => u.id === user.id) ? list : [...list, user]);
    });

    // User updated
    socket.on("user-updated", (updatedUser) => {
        users.update(list => list.map(u => u.id === updatedUser.id ? updatedUser : u));
    });

    // User deleted
    socket.on("user-deleted", ({ id }) => {
        users.update(list => list.filter(u => u.id !== id));
    });
}

/**
 * Optional helper functions to emit events to backend if needed
 */
export function createUser(userData) {
    socket?.emit("create-user", userData);
}

export function updateUser(userData) {
    socket?.emit("update-user", userData);
}

export function deleteUser(userId) {
    socket?.emit("delete-user", { id: userId });
}

/**
 * Optional: disconnect socket when not needed
 */
export function destroyUserSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
