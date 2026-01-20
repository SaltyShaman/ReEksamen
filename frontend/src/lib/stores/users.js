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
        console.log("user-created event:", user);
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
        console.log("user-updated event:", updatedUser);
        users.update(list =>
            list.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
    });

socket.on("user-deleted", ({ id }) => {
    console.log("User deleted event received:", id);
    users.update(list => {
        const newList = [...list.filter(u => u.id !== id)];
        console.log("Updated users list:", newList);
        return newList;
    });
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

