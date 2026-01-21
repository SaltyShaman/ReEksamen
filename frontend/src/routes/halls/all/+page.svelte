<script>
    import { onMount } from "svelte";
    import {halls, initHallSocket } from "$lib/stores/halls.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";

    let errorMessage = "";
    let currentUser = null;
    let authChecked = false; // tracks if auth has been checked

    // Initialize Socket.IO connection to get live updates
    initHallSocket();

    // Fetch initial list of users from backend
    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if ($isLoggedIn && currentUser.role === "ADMIN") {
            try {
                const res = await fetch("http://localhost:8080/halls", { credentials: "include" });
                const data = await res.json();

                if (!res.ok) {
                    errorMessage = data.error || "Failed to load halls";
                    return;
                }

                halls.set(data.halls);
            } catch (err) {
                console.error(err);
                errorMessage = "Server error while loading halls";
            }
        }
    });

    // Delete a hall (admin only)
    async function deleteHall(hallId) {
        if (!confirm("Are you sure you want to delete this hall?")) return;

        // Update UI immediately
        halls.update(list => list.filter(h => h.id !== hallId));

        try {
            const res = await fetch(`http://localhost:8080/halls/${hallId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete hall");
                // Optional: reload the list or revert UI update
            }
        } catch (err) {
            console.error(err);
            alert("Server error while deleting hall");
        }
    }
</script>

<main>
    {#if !authChecked}
        <p>Checking authentication...</p>
    {:else if !$isLoggedIn}
        <p>You must log in to view this page.</p>
    {:else if currentUser.role !== "ADMIN"}
        <p>You are not authorized to view this page.</p>
    {:else}
        <h1>All Halls (Admin)</h1>

        {#if errorMessage}
            <p style="color:red">{errorMessage}</p>
        {/if}

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Total Seats</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each $halls as hall}
                    <tr>
                        <td>{hall.id}</td>
                        <td>{hall.name}</td>
                        <td>{hall.created_at}</td>
                        <td>
                            <button on:click={() => deleteHall(hall.id)}>Delete</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</main>
