<script>
    import "./showtime-delete.css";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { showtimes } from "$lib/stores/showtimes.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";

    let showtime = null;
    let showtimeId = null;
    let errorMessage = "";
    let successMessage = "";
    let authChecked = false;

    onMount(async () => {
        showtimeId = $page.params.showtimeId;

        await fetchMe();
        authChecked = true;

        if (!$isLoggedIn || $authUser.role !== "ADMIN") return;

        // Try store first
        const existing = $showtimes.find(s => s.id == showtimeId);
        if (existing) {
            showtime = existing;
            return;
        }

        // Fallback to backend
        const res = await fetch(`http://localhost:8080/showtimes/${showtimeId}`, {
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) {
            errorMessage = data.error;
            return;
        }

        showtime = data.showtime;
    });

    async function deleteShowtime() {
        if (!confirm("Are you sure you want to delete this showtime?")) return;

        const res = await fetch(`http://localhost:8080/showtimes/${showtimeId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) {
            errorMessage = data.error;
            return;
        }

        successMessage = "Showtime deleted";
        setTimeout(() => goto("/showtimes"), 1200);
    }
</script>




<main class="showtime-delete-page">
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn || $authUser.role !== "ADMIN"}
        <p class="error">Not authorized</p>

    {:else if errorMessage}
        <p class="error">{errorMessage}</p>

    {:else if showtime}
        <div class="delete-card">
            <h1>Delete Showtime</h1>

            <p class="warning-text">
                This action cannot be undone.
            </p>

            <div class="showtime-info">
                <p><strong>Movie:</strong> {showtime.movie_title}</p>
                <p><strong>Hall:</strong> {showtime.hall_name}</p>
                <p><strong>Date:</strong> {new Date(showtime.show_datetime).toLocaleString()}</p>
            </div>

            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}

            <div class="actions">
                <button class="danger" on:click={deleteShowtime}>
                    Confirm Delete
                </button>

                <button class="secondary" on:click={() => goto("/showtimes")}>
                    Cancel
                </button>
            </div>
        </div>
    {/if}
</main>
