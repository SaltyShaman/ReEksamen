<script>
    import "./delete-user.css";
    import { initUserSocket } from "$lib/stores/users.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { onMount } from "svelte";

    let errorMessage = "";
    let successMessage = "";
    let currentUser = null;
    let authChecked = false;

    initUserSocket();

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if (!$isLoggedIn) {
            errorMessage = "You must be logged in to delete your account.";
        }
    });

    async function deleteAccount() {
        if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

        try {
            const res = await fetch("http://localhost:8080/users/me", {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "Delete failed";
                return;
            }

            successMessage = data.message;

            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);

        } catch {
            errorMessage = "Server error";
        }
    }
</script>

<main class="delete-page">
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p class="error">{errorMessage}</p>

    {:else}
        <div class="delete-card">
            <h1>Delete My Account</h1>

            <p class="warning-text">
                This action is permanent. Your account and all associated data will be removed.
            </p>

            <button on:click={deleteAccount} class="danger">
                Delete My Account
            </button>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}
        </div>
    {/if}
</main>
