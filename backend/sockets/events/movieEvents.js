import { broadcast } from "../broadcast.js";

export function emitMovieCreated(movie) {
    broadcast("movie-created", movie);
}

export function emitMovieDeleted(movieId) {
    broadcast("movie-deleted", { id: movieId });
}