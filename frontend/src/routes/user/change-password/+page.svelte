<script>
    import { initUserSocket } from "$lib/stores/users.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { onMount } from "svelte";

    let newPassword = "";
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
            errorMessage = "You must log in to change your password.";
        }
    });

    async function handleChangePassword(e) {
        e.preventDefault();
        errorMessage = "";
        successMessage = "";

        try {
            const res = await fetch("http://localhost:8080/users/me/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "Failed to update password";
                return;
            }

            successMessage = data.message;
            newPassword = "";

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 3000);

        } catch {
            errorMessage = "Server error";
        }
    }
</script>

<main>
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p style="color:red">{errorMessage}</p>

    {:else}
        <h1>Change Password</h1>

        <form on:submit={handleChangePassword}>
            <input
                type="password"
                placeholder="New password"
                bind:value={newPassword}
                required
            />
            <button>Update Password</button>
        </form>

        {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
        {#if successMessage}<p class="success">{successMessage}</p>{/if}
    {/if}
</main>
