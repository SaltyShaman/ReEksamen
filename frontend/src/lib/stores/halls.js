// src/lib/stores/halls.js
import { writable } from "svelte/store";
import { io } from "socket.io-client";

// Store for the list of halls
export const halls = writable([]);

// Single Socket.IO instance
let socket;
let debug = false; // set to true if you want console logs

/**
 * Initialize the Socket.IO connection and event listeners
 */
export function initHallSocket() {
    if (socket) return; // prevent multiple connections

    socket = io("http://localhost:8080", {
        withCredentials: true // allows cookies/session
    });

    if (debug) {
        socket.on("connect", () => console.log("Hall socket connected"));
        socket.on("disconnect", () => console.log("Hall socket disconnected"));
    }

    // Hall created
    socket.on("hall-created", (hall) => {
        halls.update(list => list.some(h => h.id === hall.id) ? list : [...list, hall]);
    });

    // Hall updated
    socket.on("hall-updated", (updatedHall) => {
        halls.update(list => list.map(h => h.id === updatedHall.id ? updatedHall : h));
    });

    // Hall deleted
    socket.on("hall-deleted", ({ id }) => {
        halls.update(list => list.filter(h => h.id !== id));
    });
}

/**
 * Optional helper functions to emit events to backend if needed
 */
export function createHall(hallData) {
    socket?.emit("create-hall", hallData);
}

export function updateHall(hallData) {
    socket?.emit("update-hall", hallData);
}

export function deleteHall(hallId) {
    socket?.emit("delete-hall", { id: hallId });
}

/**
 * Optional: disconnect socket when not needed
 */
export function destroyHallSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
