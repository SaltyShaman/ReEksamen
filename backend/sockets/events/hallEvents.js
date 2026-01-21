import { broadcast } from "../broadcast.js";

export function emitHallCreated(hall) {
    broadcast("hall-created", hall);
}

export function emitHallUpdated(hall) {
    broadcast("hall-updated", hall);
}

export function emitHallDeleted(hallId) {
    broadcast("hall-deleted", { id: hallId });
}