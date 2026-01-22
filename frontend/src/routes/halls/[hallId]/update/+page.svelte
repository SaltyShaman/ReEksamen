<script>
    import { onMount } from "svelte";
    import { halls, initHallSocket } from "$lib/stores/halls.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let currentUser = null;
    let authChecked = false;
    let errorMessage = "";
    let successMessage = "";

    let currentHallName = ""; // Immutable
    let newHallName = "";     // Editable

    // ✅ Use hallId to match folder name
    const hallId = $page.params.hallId;

    initHallSocket();

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if ($isLoggedIn && currentUser.role === "ADMIN") {
            try {
                const res = await fetch(`http://localhost:8080/halls/${hallId}`, { credentials: "include" });
                const data = await res.json();

                if (!res.ok) {
                    errorMessage = data.error || "Failed to load hall";
                    return;
                }

                currentHallName = data.hall.name;
                newHallName = data.hall.name; // pre-fill editable field
            } catch (err) {
                console.error(err);
                errorMessage = "Server error while loading hall";
            }
        }
    });

    async function updateHall() {
        if (!newHallName.trim()) {
            errorMessage = "New hall name cannot be empty";
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/halls/${hallId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newHallName })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "Failed to update hall";
                return;
            }

            successMessage = data.message;

            // Update store immediately
            halls.update(list => list.map(h => h.id == hallId ? { ...h, name: newHallName } : h));

            // Redirect back after 3s
            setTimeout(() => goto("/halls"), 3000);

        } catch (err) {
            console.error(err);
            errorMessage = "Server error while updating hall";
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
        <h1>Update Hall Name</h1>

        {#if errorMessage}
            <p style="color:red">{errorMessage}</p>
        {/if}

        {#if successMessage}
            <p style="color:green">{successMessage}</p>
        {/if}

        <form on:submit|preventDefault={updateHall}>
            <!-- Immutable Current Name -->
            <label>
                Current Hall Name:
                <input type="text" bind:value={currentHallName} readonly />
            </label>

            <!-- Editable New Name -->
            <label>
                New Hall Name:
                <input type="text" bind:value={newHallName} placeholder="Enter new hall name" required />
            </label>

            <button type="submit">Update</button>
            <button type="button" on:click={() => goto("/halls")}>Cancel</button>
        </form>
    {/if}
</main>
