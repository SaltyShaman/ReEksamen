<script>
    let newPassword = "";
    let errorMessage = "";
    let successMessage = "";

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
        } catch {
            errorMessage = "Server error";
        }
    }
</script>

<h1>Change Password</h1>

<form on:submit={handleChangePassword}>
    <input
        type="password"
        placeholder="New password"
        bind:value={newPassword}
        required
    />

    <button>Update Password</button>

    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    {#if successMessage}<p class="success">{successMessage}</p>{/if}
</form>
