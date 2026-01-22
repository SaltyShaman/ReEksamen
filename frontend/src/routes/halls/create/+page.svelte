<script>
    import { onMount } from "svelte";
    import { halls, initHallSocket } from "$lib/stores/halls.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";

    let currentUser = null;
    let authChecked = false;
    let errorMessage = "";
    let successMessage = "";

    let hallName = "";
    let totalSeats = "";

    initHallSocket();

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;
    });

    async function createHall() {
        errorMessage = "";
        successMessage = "";

        if (!hallName || !totalSeats || totalSeats <= 0) {
            errorMessage = "Valid hall name and total seats are required";
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/halls/create", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: hallName, totalSeats: Number(totalSeats) })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "Failed to create hall";
                return;
            }

            // Update local store immediately
            halls.update(list => [...list, data.hall]);

            successMessage = "Hall created successfully!";
            
            // Redirect to hall list after 2s
            setTimeout(() => goto("/halls"), 2000);

        } catch (err) {
            console.error(err);
            errorMessage = "Server error while creating hall";
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
        <h1>Create New Hall</h1>

        {#if errorMessage}<p style="color:red">{errorMessage}</p>{/if}
        {#if successMessage}<p style="color:green">{successMessage}</p>{/if}

        <form on:submit|preventDefault={createHall}>
            <label>
                Hall Name:
                <input type="text" bind:value={hallName} placeholder="Enter hall name" required />
            </label>

            <label>
                Total Seats:
                <input type="number" bind:value={totalSeats} placeholder="Enter total seats" min="1" required />
            </label>

            <button type="submit">Create Hall

            </button>
        </form>
    {/if}
</main>

