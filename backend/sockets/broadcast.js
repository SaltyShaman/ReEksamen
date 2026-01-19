import { getIO } from "./socketIOInstance.js";

// helped function to send data from the backend to the frontend
export function broadcast(event, data) {
    try {
        const io = getIO();
        io.emit(event, data);
    } catch (err) {
        console.error("Broadcast failed:", err.message);
    }
}
