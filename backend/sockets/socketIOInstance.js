import { Server } from "socket.io";

let io;
let debug = false //false means there is no console logging visable

const log = () => {}; //change to console.log to reenable logging

//login or session required for this socket to work. Use local sockets or a work around for create user

/**
 * Initialize Socket.IO and store the instance
 */
export function initSocket(server) {
    if (io) return io; // prevent multiple inits

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
        log("Socket disconnected:", socket.id);
    });
    });

    return io;
}

/**
 * Get the existing Socket.IO instance
 */
export function getIO() {
    if (!io) throw new Error("Socket.IO not initialized yet");
    return io;
}
