<script>
    import { onMount } from "svelte";
    import { halls, initHallSocket } from "$lib/stores/halls.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import "./hall-update.css";

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

<main class="hall-update-page">
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p class="error">You must log in to view this page.</p>

    {:else if currentUser.role !== "ADMIN"}
        <p class="error">You are not authorized to view this page.</p>

    {:else}
        <div class="update-card">
            <h1>Update Hall Name</h1>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}

            <form on:submit|preventDefault={updateHall} class="update-form">

                <div class="form-group">
                    <label>Current Hall Name</label>
                    <input
                        type="text"
                        bind:value={currentHallName}
                        readonly
                        class="readonly"
                    />
                </div>

                <div class="form-group">
                    <label>New Hall Name</label>
                    <input
                        type="text"
                        bind:value={newHallName}
                        placeholder="Enter new hall name"
                        required
                    />
                </div>

                <div class="form-actions">
                    <button type="submit" class="primary">
                        Update Hall
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
        </div>
    {/if}
</main>