import { broadcast } from "../broadcast.js";

export function emitUserCreated(user) {
    broadcast("user-created", user);
}

export function emitUserUpdated(user) {
    broadcast("user-updated", user);
}

export function emitUserDeleted(userId) {
    broadcast("user-deleted", { id: userId });
}