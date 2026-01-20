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
        withCredentials: true // allows cookies/session
    });

    socket.on("connect", () => console.log("User socket connected"));

    // Listen for user CRUD events from backend

    // New user created
    socket.on("user-created", (user) => {
        users.update(list => {
            // avoid duplicates
            if (!list.some(u => u.id === user.id)) {
                return [...list, user];
            }
            return list;
        });
    });

    // User updated
    socket.on("user-updated", (updatedUser) => {
        users.update(list =>
            list.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
    });

    // User deleted
    socket.on("user-deleted", ({ id }) => {
        users.update(list => list.filter(u => u.id !== id));
    });

    socket.on("disconnect", () => console.log("User socket disconnected"));
}

/**
 * Optional helper functions to emit events to backend if needed
 */
export function createUser(userData) {
    socket.emit("create-user", userData);
}

export function updateUser(userData) {
    socket.emit("update-user", userData);
}

export function deleteUser(userId) {
    socket.emit("delete-user", { id: userId });
}

