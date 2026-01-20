<script>
    import { onMount } from "svelte";

    let user = null;
    let error = "";

    onMount(async () => {
        try {
            const response = await fetch("http://localhost:8080/auth/me", {
                credentials: "include" // must include session cookie
            });

            if (!response.ok) {
                // not logged in → redirect to login page
                window.location.href = "/login";
                return;
            }

            const data = await response.json();
            user = data.user;
        } catch (err) {
            console.error(err);
            window.location.href = "/login";
        }
    });
</script>

<main>
    {#if user}
        <h1>Welcome, {user.username}!</h1>

        {#if user && user.role === "ADMIN"}
            <section>
                <h2>Admin Panel</h2>
                <button on:click={() => window.location.href = "/admin/users"}>
                    Full User List
                </button>
                <button on:click={() => window.location.href = "/admin/search"}>
                    Search Users
                </button>
            </section>
        {/if}

    {:else}
        <p>Checking login...</p>
    {/if}
</main>
