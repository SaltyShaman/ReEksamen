<script>
    import "./showtimes.css";
    import { onMount } from "svelte";
    import { showtimes, initShowtimeSocket, loadShowtimes } from "$lib/stores/showtimes.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { writable } from "svelte/store";
    import { goto } from "$app/navigation";

    let searchQuery = writable("");

    // Admin auth
    let currentUser = null;
    let authChecked = false;

    initShowtimeSocket();

    onMount(async () => {
        // Try fetching auth info
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        // Load all showtimes
        loadShowtimes();
    });

    // Derived filtered list
    $: filteredShowtimes = $showtimes.filter(s =>
        s.movie_title.toLowerCase().includes($searchQuery.toLowerCase())
    );

    function goToCreate() {
        goto("/showtimes/create");
    }

    function goToDelete(showtimeId) {
        goto(`/showtimes/${showtimeId}/delete`);
    }
</script>
<main class="showtimes-page">
    <h1>Upcoming Showtimes</h1>

    <div class="top-bar">
        <input
            type="text"
            placeholder="Search by movie title..."
            bind:value={$searchQuery}
        />

        {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
            <button class="primary" on:click={goToCreate}>
                + Create Showtime
            </button>
        {/if}
    </div>

    {#if filteredShowtimes.length === 0}
        <p class="empty">No showtimes found.</p>
    {:else}
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Movie</th>
                        <th>Hall</th>
                        <th>Show Date & Time</th>
                        {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
                            <th>Actions</th>
                        {/if}
                    </tr>
                </thead>
                <tbody>
                    {#each filteredShowtimes as s}
                        <tr>
                            <td>{s.movie_title}</td>
                            <td>{s.hall_name}</td>
                            <td>{new Date(s.show_datetime).toLocaleString()}</td>

                            {#if authChecked && $isLoggedIn && currentUser?.role === "ADMIN"}
                                <td>
                                    <button
                                        class="danger"
                                        on:click={() => goToDelete(s.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>