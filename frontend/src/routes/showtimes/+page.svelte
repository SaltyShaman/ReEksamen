<script>
    import { onMount } from "svelte";
    import { showtimes, initShowtimeSocket, loadShowtimes } from "$lib/stores/showtimes.js";
    import { writable } from "svelte/store";

    let searchQuery = writable("");

    initShowtimeSocket();

    onMount(() => {
        loadShowtimes();
    });

    // Derived filtered list
    $: filteredShowtimes = $showtimes.filter(s =>
        s.movie_title.toLowerCase().includes($searchQuery.toLowerCase())
    );
</script>

<main>
    <h1>Upcoming Showtimes</h1>

    <input
        type="text"
        placeholder="Search by movie title..."
        bind:value={$searchQuery}
    />

    {#if filteredShowtimes.length === 0}
        <p>No showtimes found.</p>
    {:else}
        <table>
            <thead>
                <tr>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Show Date & Time</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredShowtimes as s}
                <tr>
                    <td>{s.movie_title}</td>
                    <td>{s.hall_name}</td>
                    <td>{new Date(s.show_datetime).toLocaleString()}</td>
                </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</main>
