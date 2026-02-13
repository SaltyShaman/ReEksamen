<script>
  import "./movie-create.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { initMovieSocket } from "$lib/stores/movies.js";

  let currentUser = null;
  let authChecked = false;

  let title = "";
  let description = "";
  let durationMinutes = "";
  let releaseDate = "";

  let errorMessage = "";
  let successMessage = "";

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    if ($isLoggedIn && currentUser?.role === "ADMIN") {
      initMovieSocket();
    }
  });

  async function createMovie() {
    errorMessage = "";
    successMessage = "";

    if (!title.trim() || !durationMinutes) {
      errorMessage = "Title and duration are required";
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          duration_minutes: Number(durationMinutes),
          release_date: releaseDate || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        errorMessage = data.error || "Failed to create movie";
        return;
      }

      successMessage = data.message || "Movie created successfully";

      // Redirect after short delay
      setTimeout(() => goto("/movies"), 2000);
    } catch (err) {
      console.error(err);
      errorMessage = "Server error while creating movie";
    }
  }
</script>
<main class="movie-create-page">
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p class="error">You must be logged in to access this page.</p>

  {:else if currentUser.role !== "ADMIN"}
    <p class="error">You are not authorized to create movies.</p>

  {:else}
    <h1>Create Movie</h1>

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}

    {#if successMessage}
      <p class="success">{successMessage}</p>
    {/if}

    <form on:submit|preventDefault={createMovie} class="movie-form">

      <div class="form-group">
        <label>Title *</label>
        <input type="text" bind:value={title} required />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea bind:value={description}></textarea>
      </div>

      <div class="form-group">
        <label>Duration (minutes) *</label>
        <input type="number" bind:value={durationMinutes} min="1" required />
      </div>

      <div class="form-group">
        <label>Release Date</label>
        <input type="date" bind:value={releaseDate} />
      </div>

      <div class="form-actions">
        <button type="submit" class="primary">
          Create Movie
        </button>

        <button
          type="button"
          class="secondary"
          on:click={() => goto("/dashboard")}
        >
          Cancel
        </button>
      </div>

    </form>
  {/if}
</main>
