<script>
    import "./login.css";

    let username = "";
    let password = "";
    let errorMessage = "";

    async function handleLogin(e) {
        e.preventDefault();
        errorMessage = "";

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // required for sessions
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const data = await response.json();
                errorMessage = data.message || "Login failed";
                return;
            }

            const data = await response.json();
            console.log("Logged in user:", data.user);

            window.location.href = "/dashboard"; // important: it has to use the folder name
        } catch (err) {
            console.error(err);
            errorMessage = "An error occurred during login";
        }
    }
</script>

<main class="login-page">
    <div class="login-card">
        <h1>Login</h1>

        <form on:submit={handleLogin}>
            <div class="form-group">
                <label for="username">Username</label>
                <input id="username" bind:value={username} required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" bind:value={password} required />
            </div>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            <button type="submit">Login</button>
        </form>
    </div>
</main>