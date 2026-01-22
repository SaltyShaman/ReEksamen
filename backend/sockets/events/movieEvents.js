import { broadcast } from "../broadcast.js";

export function emitMovieCreated(movie) {
    broadcast("movie-created", movie);
}

export function emitMovieUpdated(movie) {
    broadcast("movie-updated", movie);
}

export function emitMovieDeleted(movieId) {
    broadcast("movie-deleted", { id: movieId });
}