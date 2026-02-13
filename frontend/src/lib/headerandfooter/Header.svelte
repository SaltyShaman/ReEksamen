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
<header class="app-header">

    <div class="nav-left">
        <a href="/dashboard" class="logo">🎬 CinemaApp</a>

        <nav>
            <a href="/movies">Movies</a>
            <a href="/showtimes">Showtimes</a>
            <a href="/reservations/create">Book</a>
        </nav>
    </div>

    <div class="nav-right">

        <div class="user-links">
            <a href="/user/create">Sign up</a>
            <a href="/user/change-password">Change Password</a>
            <a href="/user/delete">Delete Account</a>
        </div>

        <div class="user-info">
            {#if user}
                <span>Welcome, {user.username}</span>
                <button on:click={logout}>Logout</button>
            {:else}
                <a href="/login">Login</a>
            {/if}
        </div>

    </div>

</header>