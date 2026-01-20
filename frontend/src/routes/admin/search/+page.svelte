<script>
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";

    let searchName = "";
    let user = null;
    let errorMessage = "";
    let suggestions = [];

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

    // Update suggestions as the user types
    $: if (searchName) {
        suggestions = $users
            .filter(u => u.username.toLowerCase().startsWith(searchName.toLowerCase()))
            .slice(0, 10); // limit to 10 suggestions
    } else {
        suggestions = [];
    }

    async function handleSearch(e) {
        e.preventDefault();
        user = null;
        errorMessage = "";

        if (!searchName) {
            errorMessage = "Please enter a username";
            return;
        }

        const matchedUser = $users.find(u =>
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
            suggestions = []; // clear suggestions after search
        } catch (err) {
            console.error(err);
            errorMessage = "Server error while fetching user";
        }
    }

    function selectSuggestion(username) {
        searchName = username;
        suggestions = [];
    }
</script>

<main>
    <h1>Search User (Admin)</h1>

<form on:submit={handleSearch} style="position: relative;">
    <input
        type="text"
        placeholder="Enter username"
        bind:value={searchName}
        autocomplete="off"
    />
    <button type="submit">Search</button>

    {#if suggestions.length > 0}
        <div class="suggestions">
            {#each suggestions as s}
                <div class="suggestion-item" on:click={() => selectSuggestion(s.username)}>
                    {s.username}
                </div>
            {/each}
        </div>
    {/if}
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


