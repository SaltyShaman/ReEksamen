<script>
  import { onMount } from "svelte";
  import { writable, derived } from "svelte/store";
  import { goto } from "$app/navigation";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { movies, initMovieSocket } from "$lib/stores/movies.js";

  let currentUser = null;
  let authChecked = false;
  let errorMessage = "";

  const searchQuery = writable("");

  const filteredMovies = derived(
    [movies, searchQuery],
    ([$movies, $searchQuery]) =>
      $movies.filter(m =>
        m.title.toLowerCase().includes($searchQuery.toLowerCase())
      )
  );

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    if (!$isLoggedIn || currentUser?.role !== "ADMIN") return;

    initMovieSocket();

    try {
      const res = await fetch("http://localhost:8080/movies", {
        credentials: "include"
      });
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
  });

  async function deleteMovie(movie) {
    if (!confirm(`Delete "${movie.title}" permanently?`)) return;

    try {
      const res = await fetch(
        `http://localhost:8080/movies/${movie.id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete movie");
      }


      // socket event handles state update
        
      //redirect afterwards
      setTimeout(() => goto("/movies"), 2000);

    } catch (err) {
      console.error(err);
      alert("Server error while deleting movie");
    }
  }
</script>

<main>
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p>You must be logged in to view this page.</p>

  {:else if currentUser.role !== "ADMIN"}
    <p>You are not authorized to delete movies.</p>

  {:else}
    <h1>Delete Movies</h1>

    {#if errorMessage}
      <p style="color:red">{errorMessage}</p>
    {/if}

    <input
      type="text"
      placeholder="Search movies by title..."
      bind:value={$searchQuery}
    />

    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Duration</th>
          <th>Release Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $filteredMovies as movie}
          <tr>
            <td>{movie.title}</td>
            <td>{movie.duration_minutes} min</td>
            <td>{movie.release_date || "-"}</td>
            <td>
              <button
                on:click={() => deleteMovie(movie)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}

        {#if $filteredMovies.length === 0}
          <tr>
            <td colspan="4" style="text-align:center">
              No movies found
            </td>
          </tr>
        {/if}
      </tbody>
    </table>

    <button on:click={() => goto("/movies")}>
      Back to Movies
    </button>
  {/if}
</main>
