<script>
  import { onMount } from "svelte";
  import { writable, derived } from "svelte/store";

  let errorMessage = "";
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

  onMount(() => {
    loadMovies();
  });
</script>

<main>
  <h1>Available Movies</h1>

  {#if errorMessage}
    <p style="color:red">{errorMessage}</p>
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
      </tr>
    </thead>
    <tbody>
      {#each $filteredMovies as movie}
        <tr>
          <td>{movie.title}</td>
          <td>{movie.description || "-"}</td>
          <td>{movie.duration_minutes}</td>
          <td>{movie.release_date || "-"}</td>
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


