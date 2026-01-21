<script>
    import { onMount } from "svelte";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";

    let currentUser = null;
    let authChecked = false; // track if auth is loaded
    let error = "";

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if (!$isLoggedIn) {
            error = "You must log in to access the dashboard.";
        }
    });
</script>

<main>
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p style="color:red">{error}</p>

    {:else}
        <h1>Welcome, {currentUser.username}!</h1>

        {#if currentUser.role === "ADMIN"}
            <section>
                <h2>Admin Panel</h2>
                <button on:click={() => window.location.href = "/admin/users"}>
                    Full User List
                </button>
                <button on:click={() => window.location.href = "/admin/search"}>
                    Search Users
                </button>
                <button on:click={() => window.location.href = "/halls/all"}>
                    See all halls
                </button>

            </section>
        {/if}

        {#if currentUser.role !== "ADMIN"}
            <p>This is your standard dashboard.</p>
        {/if}
    {/if}
</main>
