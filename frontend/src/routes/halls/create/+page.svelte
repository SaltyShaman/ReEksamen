<script>
    import { onMount } from "svelte";
    import { halls, initHallSocket } from "$lib/stores/halls.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";
    import "./create-hall.css";

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

<main class="hall-create-page">
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p class="error">You must log in to view this page.</p>

    {:else if currentUser.role !== "ADMIN"}
        <p class="error">You are not authorized to view this page.</p>

    {:else}
        <h1>Create New Hall</h1>

        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {/if}

        {#if successMessage}
            <p class="success">{successMessage}</p>
        {/if}

        <form on:submit|preventDefault={createHall} class="hall-form">

            <div class="form-group">
                <label>Hall Name *</label>
                <input
                    type="text"
                    bind:value={hallName}
                    placeholder="Enter hall name"
                    required
                />
            </div>

            <div class="form-group">
                <label>Total Seats *</label>
                <input
                    type="number"
                    bind:value={totalSeats}
                    min="1"
                    placeholder="Enter total seats"
                    required
                />
            </div>

            <div class="form-actions">
                <button type="submit" class="primary">
                    Create Hall
                </button>

                <button
                    type="button"
                    class="secondary"
                    on:click={() => goto("/halls")}
                >
                    Cancel
                </button>
            </div>

        </form>
    {/if}
</main>


