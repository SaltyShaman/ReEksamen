import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: { origin: "http://localhost:5173" } 
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io; 
}

// Export the io instance to use in broadcast.js
export function getIO() {
    if (!io) throw new Error("Socket.IO not initialized yet");
    return io;
}
