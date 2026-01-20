<script>
    import { onMount } from "svelte";
    import { users, initUserSocket } from "$lib/stores/users.js";

    let errorMessage = "";

    // Initialize Socket.IO connection to get live updates
    initUserSocket();

    // Fetch initial list of users from backend
    onMount(async () => {
        try {
            const res = await fetch("http://localhost:8080/users", {
                credentials: "include" // include session cookie
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.error || "Failed to load users";
                return;
            }

            users.set(data.users); // populate store
        } catch (err) {
            console.error(err);
            errorMessage = "Server error";
        }
    });

    // Delete a user (admin only)
    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        //ui update:
        users.update(list => [...list.filter(u => u.id !== userId)]);

        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to delete user");
            }

            // user store will auto-update via socket event
        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    }
</script>

<main>
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
                        <button on:click={() => deleteUser(user.id)}>
                            Delete
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</main>
