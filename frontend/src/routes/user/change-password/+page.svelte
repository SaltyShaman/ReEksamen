<script>
    import "./change-password.css";
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

<main class="change-password-page">
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p class="error">{errorMessage}</p>

    {:else}
        <div class="change-password-card">
            <h1>Change Password</h1>

            <form on:submit={handleChangePassword}>
                <div class="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        bind:value={newPassword}
                        required
                    />
                </div>

                <button type="submit">Update Password</button>
            </form>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}
        </div>
    {/if}
</main>
