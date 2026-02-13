<script>
    import "./admin-users.css";
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";

    let errorMessage = "";
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

    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        users.update(list => list.filter(u => u.id !== userId));

        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete user");
            }
        } catch (err) {
            console.error(err);
            alert("Server error while deleting user");
        }
    }
</script>

<main class="admin-users-page">
    {#if !authChecked}
        <p class="status">Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p class="error">You must log in to view this page.</p>

    {:else if currentUser.role !== "ADMIN"}
        <p class="error">You are not authorized to view this page.</p>

    {:else}
        <div class="users-card">
            <h1>All Users</h1>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $users as user}
                        <tr>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>
                                <span class="role-badge {user.role === 'ADMIN' ? 'admin' : 'user'}">
                                    {user.role}
                                </span>
                            </td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                                <button 
                                    class="danger"
                                    on:click={() => deleteUser(user.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>
