<script>
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";

    let searchName = "";
    let user = null;
    let errorMessage = "";

    // Initialize socket for live updates
    initUserSocket();

    // Fetch initial users for searching
    onMount(async () => {
        try {
            const res = await fetch("http://localhost:8080/users", {
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "Failed to load users";
                return;
            }

            users.set(data.users);
        } catch (err) {
            console.error(err);
            errorMessage = "Server error while loading users";
        }
    });

    async function handleSearch(e) {
        e.preventDefault();
        user = null;
        errorMessage = "";

        if (!searchName) {
            errorMessage = "Please enter a username";
            return;
        }

        // Subscribe to the store temporarily to get current users
        let currentUsers;
        users.subscribe(list => currentUsers = list)(); // immediately unsubscribe

        const matchedUser = currentUsers.find(u =>
            u.username.toLowerCase() === searchName.toLowerCase()
        );

        if (!matchedUser) {
            errorMessage = "User not found in local list";
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/users/${matchedUser.id}`, {
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "User not found";
                return;
            }

            user = data.user;
        } catch (err) {
            console.error(err);
            errorMessage = "Server error while fetching user";
        }
    }
</script>

<main>
    <h1>Search User (Admin)</h1>

    <form on:submit={handleSearch}>
        <input
            type="text"
            placeholder="Enter username"
            bind:value={searchName}
            required
        />
        <button type="submit">Search</button>
    </form>

    {#if errorMessage}
        <p style="color:red">{errorMessage}</p>
    {/if}

    {#if user}
        <h2>User Found:</h2>
        <ul>
            <li>ID: {user.id}</li>
            <li>Username: {user.username}</li>
            <li>Role: {user.role}</li>
            <li>Created At: {user.created_at}</li>
        </ul>
    {/if}
</main>
