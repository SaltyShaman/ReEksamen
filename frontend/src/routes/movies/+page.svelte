<script>
  import { onMount } from "svelte";
  import { writable, derived } from "svelte/store";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";



  let errorMessage = "";
  let authChecked = false;
  let currentUser = null;

  let movies = writable([]);
  let searchQuery = writable("");

  // Filter movies based on search query
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

      loadMovies(); // refresh list
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

<main>
  <h1>Available Movies</h1>

  {#if errorMessage}
    <p style="color:red">{errorMessage}</p>
  {/if}

   <!-- Admin controls -->
  {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
    <div style="margin-bottom: 1rem;">
      <button on:click={() => goto("/movies/create")}>
        ➕ Create Movie
      </button>
    </div>
  {/if}


  <!-- Search input -->
  <input
    type="text"
    placeholder="Search movies by title..."
    bind:value={$searchQuery}
  />

  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Description</th>
        <th>Duration (minutes)</th>
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
          <td>{movie.duration_minutes}</td>
          <td>{movie.release_date || "-"}</td>

          {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
            <td>
              <button
                style="color:red"
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
          <td>No movies found.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</main>


