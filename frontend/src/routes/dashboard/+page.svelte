<script>
    import "./dashboard.css";
    import { onMount } from "svelte";
    import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";

    let currentUser = null;
    let authChecked = false;
    let error = "";

    let reservations = [];

    async function loadReservations() {
        try {
            const res = await fetch(
                "http://localhost:8080/reservations/my?type=active",
                { credentials: "include" }
            );

            if (!res.ok) {
                reservations = [];
                return;
            }

            const data = await res.json();
            reservations = data.reservations ?? [];
        } catch (err) {
            console.error(err);
            reservations = [];
        }
    }

    async function cancelReservation(id) {
        if (!confirm("Are you sure you want to cancel this reservation?")) {
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8080/reservations/${id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            if (!res.ok) return;

            reservations = reservations.filter(
                r => r.reservationGroupId !== id
            );

        } catch (err) {
            console.error(err);
        }
    }

    onMount(async () => {
        await fetchMe();
        currentUser = $authUser;
        authChecked = true;

        if (!$isLoggedIn) {
            error = "You must log in to access the dashboard.";
            return;
        }

        if (currentUser.role !== "ADMIN") {
            await loadReservations();
        }
    });
</script>

<main>
    {#if !authChecked}
        <p>Checking authentication...</p>

    {:else if !$isLoggedIn}
        <p style="color:red">{error}</p>

    {:else}
        <h1>Welcome, {currentUser.username}!</h1>

<!-- ================= ADMIN SECTION ================= -->
{#if currentUser.role === "ADMIN"}
    <section class="admin-panel">
        <h2>Admin Panel</h2>

        <div class="admin-group">
            <h3>Users</h3>
            <div class="button-group">
                <button on:click={() => window.location.href = "/admin/users"}>
                    Full User List
                </button>
                <button on:click={() => window.location.href = "/admin/search"}>
                    Search Users
                </button>
            </div>
        </div>

        

        <div class="admin-group">
            <h3>Halls</h3>
            <div class="button-group">
                <button on:click={() => window.location.href = "/halls"}>
                    See all halls
                </button>
                <button on:click={() => window.location.href = "/halls/search"}>
                    Search halls
                </button>
            </div>
        </div>

        <div class="admin-group">
            <h3>Movies</h3>
            <div class="button-group">
                <button on:click={() => window.location.href = "/movies/create"}>
                    Register new movie
                </button>
                <button on:click={() => window.location.href = "/movies/delete"}>
                    Delete movie
                </button>
            </div>
        </div>

        <div class="admin-group">
            <h3>Showtimes</h3>
            <div class="button-group">
                <button on:click={() => window.location.href = "/showtimes"}>
                    Manage showtimes
                </button>
            </div>
        </div>

        <div class="admin-group">
            <h3>Reservations</h3>
            <div class="button-group">
                <button on:click={() => window.location.href = "/reservations/admin"}>
                    Manage Reservations
                </button>
            </div>
        </div>
    </section>
{/if}

        <!-- ================= USER SECTION ================= -->
        {#if currentUser.role !== "ADMIN"}
           <section class="user-section">
                <h2>My Active Reservations</h2>

        <div class="user-actions">
            <button on:click={() => goto("/reservations/create")}>
                + New Reservation
            </button>
        </div>

                {#if reservations.length === 0}
                    <p>No active reservations.</p>
                {:else}
                    <table class="reservation-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Movie</th>
                                <th>Showtime</th>
                                <th>Seats</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each reservations as r}
                                <tr>
                                    <td>{r.reservationGroupId}</td>
                                    <td>{r.title}</td>
                                    <td>{r.show_datetime}</td>
                                    <td>{r.seats}</td>
                                    <td>
                                        <button
                                            on:click={() =>
                                                cancelReservation(r.reservationGroupId)
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            on:click={() =>
                                                goto(`/reservations/${r.reservationGroupId}/edit`)
                                            }
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </section>
        {/if}
    {/if}
</main>
