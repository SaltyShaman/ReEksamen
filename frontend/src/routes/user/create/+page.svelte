<script>
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

            if (!response.ok) {
                const data = await response.json();
                // show backend error (username taken, etc.)
                errorMessage = data.message || data.error || "Failed to create user";
                return;
            }

            const data = await response.json();
            successMessage = `User "${username}" created successfully!`;

            username = "";
            password = "";

        } catch (err) {
            console.error(err);
            errorMessage = "An error occurred while creating the user";
        }
    }
</script>

<main>
    <h1>Create User</h1>

    <form on:submit={handleCreateUser}>
        <div>
            <label for="username">Username:</label>
            <input id="username" bind:value={username} required />
        </div>

        <div>
            <label for="password">Password:</label>
            <input id="password" type="password" bind:value={password} required />
        </div>

        {#if errorMessage}
            <p style="color:red">{errorMessage}</p>
        {/if}

        {#if successMessage}
            <p style="color:green">{successMessage}</p>
        {/if}

        <button type="submit">Create User</button>
    </form>
</main>
