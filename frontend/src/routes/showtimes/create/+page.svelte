<script>
    import "./showtime-create.css";
    import { onMount } from "svelte";
    import { showtimes } from "$lib/stores/showtimes.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { halls, initHallSocket } from "$lib/stores/halls.js";
    import { movies, initMovieSocket } from "$lib/stores/movies.js";
    import { goto } from "$app/navigation";

    let currentUser = null;
    let authChecked = false;
    let errorMessage = "";
    let successMessage = "";

    let selectedMovieId = "";
    let selectedHallId = "";
    let showDateTime = "";
    let movieSearch = ""; // search input

    initHallSocket();
    initMovieSocket();

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if (!$isLoggedIn || currentUser?.role !== "ADMIN") return;

        // Load halls
        if ($halls.length === 0) {
            const res = await fetch("http://localhost:8080/halls", { credentials: "include" });
            const data = await res.json();
            halls.set(data.halls);
        }

        // Always load movies
        const movieRes = await fetch("http://localhost:8080/movies", {
            credentials: "include"
        });
        const movieData = await movieRes.json();
        movies.set(movieData.movies ?? []);
        });

    // filtered movies based on search
    $: filteredMovies = $movies.filter(m =>
     m?.title?.toLowerCase()?.includes(movieSearch.toLowerCase())
    );

async function handleCreate() {
    errorMessage = "";
    successMessage = "";

    if (!selectedMovieId || !selectedHallId || !showDateTime) {
        errorMessage = "All fields are required";
        return;
    }

    const showDate = new Date(showDateTime);
    if (isNaN(showDate.getTime()) || showDate <= new Date()) {
        errorMessage = "Please enter a valid future date and time";
        return;
    }

    // Convert to YYYY-MM-DDTHH:MM:SS format
    const pad = (num) => num.toString().padStart(2, "0");
    const isoString = `${showDate.getFullYear()}-${pad(showDate.getMonth() + 1)}-${pad(showDate.getDate())}T${pad(showDate.getHours())}:${pad(showDate.getMinutes())}:${pad(showDate.getSeconds())}`;

    try {
        const res = await fetch("http://localhost:8080/showtimes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                movie_id: Number(selectedMovieId),
                hall_id: Number(selectedHallId),
                show_datetime: isoString
            })
        });

        const data = await res.json();
        if (!res.ok) {
            errorMessage = data.error || "Failed to create showtime";
            return;
        }

        showtimes.update(list => [...list, data.showtime]);
        successMessage = "Showtime created successfully!";
        setTimeout(() => goto("/showtimes"), 2000);

    } catch (err) {
        console.error(err);
        errorMessage = "Server error while creating showtime";
    }
}

</script>

<main class="showtime-create-page">
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn || currentUser.role !== "ADMIN"}
        <p class="error">You are not authorized to view this page.</p>

    {:else}
        <h1>Create New Showtime</h1>

        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {/if}

        {#if successMessage}
            <p class="success">{successMessage}</p>
        {/if}

        <form on:submit|preventDefault={handleCreate} class="showtime-form">


            <div class="form-group">
                <label>Movie *</label>
                <select bind:value={selectedMovieId} required>
                    <option value="">Select a movie</option>
                    {#each filteredMovies as movie}
                        <option value={movie.id}>{movie.title}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label>Hall *</label>
                <select bind:value={selectedHallId} required>
                    <option value="">Select a hall</option>
                    {#each $halls as hall}
                        <option value={hall.id}>{hall.name}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label>Show Date & Time *</label>
                <input
                    type="datetime-local"
                    bind:value={showDateTime}
                    required
                />
            </div>

            <div class="form-actions">
                <button type="submit" class="primary">
                    Create Showtime
                </button>

                <button
                    type="button"
                    class="secondary"
                    on:click={() => goto("/showtimes")}
                >
                    Cancel
                </button>
            </div>

        </form>
    {/if}
</main>
