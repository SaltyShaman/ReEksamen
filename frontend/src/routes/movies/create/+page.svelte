<script>
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

<main>
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p>You must be logged in to access this page.</p>

  {:else if currentUser.role !== "ADMIN"}
    <p>You are not authorized to create movies.</p>

  {:else}
    <h1>Create Movie</h1>

    {#if errorMessage}
      <p style="color:red">{errorMessage}</p>
    {/if}

    {#if successMessage}
      <p style="color:green">{successMessage}</p>
    {/if}

    <form on:submit|preventDefault={createMovie}>
      <label>
        Title *
        <input type="text" bind:value={title} required />
      </label>

      <label>
        Description
        <textarea bind:value={description}></textarea>
      </label>

      <label>
        Duration (minutes) *
        <input type="number" bind:value={durationMinutes} min="1" required />
      </label>

      <label>
        Release Date
        <input type="date" bind:value={releaseDate} />
      </label>

      <div>
        <button type="submit">Create Movie</button>
        <button type="button" on:click={() => goto("/dashboard")}>
          Cancel
        </button>
      </div>
    </form>
  {/if}
</main>
