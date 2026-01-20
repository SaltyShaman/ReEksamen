<script>
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";

    let errorMessage = "";
    let currentUser = null;
    let authChecked = false; // tracks if auth has been checked

    // Initialize Socket.IO connection to get live updates
    initUserSocket();

    // Fetch initial list of users from backend
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

    // Delete a user (admin only)
    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        // Update UI immediately
        users.update(list => list.filter(u => u.id !== userId));

        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete user");
                // Optional: reload the list or revert UI update
            }
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
        <h1>All Users (Admin)</h1>

        {#if errorMessage}
            <p style="color:red">{errorMessage}</p>
        {/if}

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each $users as user}
                    <tr>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
                        <td>{user.created_at}</td>
                        <td>
                            <button on:click={() => deleteUser(user.id)}>Delete</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</main>
