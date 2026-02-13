<script>
    import "./create-user.css";

    let username = "";
    let password = "";
    let errorMessage = "";
    let successMessage = "";

    async function handleCreateUser(e) {
        e.preventDefault();
        errorMessage = "";
        successMessage = "";

        const userData = { username, password };

        try {
            const response = await fetch("http://localhost:8080/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage = data.message || data.error || "Failed to create user";
                return;
            }

            successMessage = `User "${username}" created successfully! Redirecting to login page...`;

            username = "";
            password = "";

            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);

        } catch (err) {
            console.error(err);
            errorMessage = "An error occurred while creating the user";
        }
    }
</script>

<main class="create-user-page">
    <div class="create-user-card">
        <h1>Create User</h1>

        <form on:submit={handleCreateUser}>
            <div class="form-group">
                <label for="username">Username</label>
                <input id="username" bind:value={username} required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input id="password" type="password" bind:value={password} required />
            </div>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}

            <button type="submit">Create Account</button>
        </form>
    </div>
</main>
