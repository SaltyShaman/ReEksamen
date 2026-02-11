<script>
    import { onMount } from "svelte";

    let user = null;

    onMount(async () => {
        try {
            const res = await fetch("http://localhost:8080/auth/me", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                user = data.user;
            }
        } catch (err) {
            console.error(err);
        }
    });

    async function logout() {
        try {
            const res = await fetch("http://localhost:8080/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                user = null;
                window.location.href = "/login";
            }
        } catch (err) {
            console.error(err);
        }
    }
</script>

<header>

    <div>
        <a href="/user/create">Sign up</a>
    </div>

    <div>
        <a href="/dashboard">Home</a>
    </div>

    <div>
        <a href="/user/change-password">Change Password</a>
    </div>

    <div>
        <a href="/user/delete">Delete account?</a>
    </div>

    <div>
        <a href="/movies">Browse movies</a>
    </div>

    <div>
        <a href="/showtimes">Browse showtimes</a>
    </div>

    <div>
        <a href="/reservations/create">Book reservation</a>
    </div>

    <div>
        {#if user}
            <span>Welcome, {user.username}</span>
            <button on:click={logout}>Logout</button>
        {:else}
            <a href="/login">Login</a>
        {/if}
    </div>
</header>
