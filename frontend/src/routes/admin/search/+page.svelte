<script>
    import "./admin-user-search.css";
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";

    let searchName = "";
    let user = null;
    let errorMessage = "";
    let suggestions = [];
    let currentUser = null;
    let authChecked = false;

    initUserSocket();

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if ($isLoggedIn && currentUser.role === "ADMIN") {
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

    $: if (searchName) {
        suggestions = $users
            .filter(u =>
                u.username.toLowerCase().startsWith(searchName.toLowerCase())
            )
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

        const matchedUser = $users.find(
            u => u.username.toLowerCase() === searchName.toLowerCase()
        );

        if (!matchedUser) {
            errorMessage = "User not found";
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8080/users/${matchedUser.id}`,
                { credentials: "include" }
            );

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
            const res = await fetch(
                `http://localhost:8080/users/${userId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete user");
                return;
            }

            user = null;
            searchName = "";
            suggestions = [];
        } catch (err) {
            console.error(err);
            alert("Server error while deleting user");
        }
    }
</script>

<main class="admin-search-page">
    {#if !authChecked}
        <p class="status">Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p class="error">You must log in to view this page.</p>

    {:else if currentUser.role !== "ADMIN"}
        <p class="error">You are not authorized to view this page.</p>

    {:else}
        <div class="search-card">
            <h1>Search User</h1>

            <form on:submit={handleSearch} class="search-form">
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
                            <div
                                class="suggestion-item"
                                on:click={() => selectSuggestion(s.username)}
                            >
                                {s.username}
                            </div>
                        {/each}
                    </div>
                {/if}
            </form>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            {#if user}
                <div class="result-card">
                    <h2>User Found</h2>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>

                    <button
                        class="danger"
                        on:click={() => deleteUser(user.id)}
                    >
                        Delete User
                    </button>
                </div>
            {/if}
        </div>
    {/if}
</main>
