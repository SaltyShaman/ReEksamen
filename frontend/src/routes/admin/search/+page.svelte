<script>
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";

    let searchName = "";
    let user = null;
    let errorMessage = "";
    let suggestions = [];
    let currentUser = null;
    let authChecked = false; // to know when we finished checking auth

    // Initialize socket for live updates
    initUserSocket();

    onMount(async () => {
        // Fetch authenticated user
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if ($isLoggedIn && currentUser.role === "ADMIN") {
            // Fetch initial list of users for suggestions/search
            try {
                const res = await fetch("http://localhost:8080/users", { credentials: "include" });
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
        }
    });

    // Update suggestions as user types
    $: if (searchName) {
        suggestions = $users
            .filter(u => u.username.toLowerCase().startsWith(searchName.toLowerCase()))
            .slice(0, 10);
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
            suggestions = [];
        } catch (err) {
            console.error(err);
            errorMessage = "Server error while fetching user";
        }
    }

    function selectSuggestion(username) {
        searchName = username;
        suggestions = [];
    }

    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete user");
                return;
            }

            // Reset local view
            user = null;
            searchName = "";
            suggestions = [];

            // The users store will auto-update via the socket
        } catch (err) {
            console.error(err);
            alert("Server error while deleting user");
        }
    }
</script>

<main>
    {#if !authChecked}
        <p>Checking authentication...</p>
    {:else if !$isLoggedIn}
        <p>You must log in to view this page.</p>
    {:else if currentUser.role !== "ADMIN"}
        <p>You are not authorized to view this page.</p>
    {:else}
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
            <div>
                <p>ID: {user.id}</p>
                <p>Username: {user.username}</p>
                <p>Role: {user.role}</p>
                <p>Created At: {user.created_at}</p>

                <button on:click={() => deleteUser(user.id)}>Delete User</button>
            </div>
        {/if}
    {/if}
</main>
