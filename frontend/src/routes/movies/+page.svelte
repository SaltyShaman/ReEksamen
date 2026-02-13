<script>
  import "./movies.css";
  import { onMount } from "svelte";
  import { writable, derived } from "svelte/store";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";

  let errorMessage = "";
  let authChecked = false;
  let currentUser = null;

  let movies = writable([]);
  let searchQuery = writable("");

  const filteredMovies = derived(
    [movies, searchQuery],
    ([$movies, $searchQuery]) =>
      $movies.filter(movie =>
        movie.title.toLowerCase().includes($searchQuery.toLowerCase())
      )
  );

  async function loadMovies() {
    try {
      const res = await fetch("http://localhost:8080/movies");
      const data = await res.json();

      if (!res.ok) {
        errorMessage = data.error || "Failed to load movies";
        return;
      }

      movies.set(data.movies);
    } catch (err) {
      console.error(err);
      errorMessage = "Server error while loading movies";
    }
  }

  async function deleteMovie(movieId) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`http://localhost:8080/movies/${movieId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete movie");
        return;
      }

      loadMovies();
    } catch (err) {
      console.error(err);
      alert("Server error while deleting movie");
    }
  }

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;
    loadMovies();
  });
</script>

<main class="movies-page">
  <h1>Available Movies</h1>

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
    <div class="admin-actions">
      <button class="primary" on:click={() => goto("/movies/create")}>
        + Create Movie
      </button>
    </div>
  {/if}

  <div class="search-bar">
    <input
      type="text"
      placeholder="Search movies by title..."
      bind:value={$searchQuery}
    />
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Duration</th>
          <th>Release Date</th>
          {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
            <th>Actions</th>
          {/if}
        </tr>
      </thead>

      <tbody>
        {#each $filteredMovies as movie}
          <tr>
            <td>{movie.title}</td>
            <td>{movie.description || "-"}</td>
            <td>{movie.duration_minutes} min</td>
            <td>{movie.release_date || "-"}</td>

            {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
              <td>
                <button
                  class="danger"
                  on:click={() => deleteMovie(movie.id)}
                >
                  Delete
                </button>
              </td>
            {/if}
          </tr>
        {/each}

        {#if $filteredMovies.length === 0}
          <tr>
            <td colspan="5" class="empty">
              No movies found.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</main>

