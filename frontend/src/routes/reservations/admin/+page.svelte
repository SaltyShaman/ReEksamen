<script>
  import "./admin-reservations.css";
  import { onMount, onDestroy } from "svelte";
  import { fetchMe, authUser, isLoggedIn } from "$lib/stores/auth.js";
  import {
    initReservationSocket,
    destroyReservationSocket
  } from "$lib/stores/reservations.js";

  let reservations = [];
  let authChecked = false;
  let currentUser = null;
  let error = "";

  /**
   * Load active reservations (ADMIN)
   */
  async function loadReservations() {
    try {
      const res = await fetch(
        "http://localhost:8080/reservations/admin/active",
        { credentials: "include" }
      );

      if (!res.ok) {
        error = "Failed to load reservations.";
        reservations = [];
        return;
      }

      const data = await res.json();
      reservations = data.reservations ?? [];
    } catch (err) {
      console.error(err);
      error = "Server error while loading reservations.";
      reservations = [];
    }
  }

  /**
   * Admin delete reservation
   */
  async function deleteReservation(id) {
    try {
      const res = await fetch(
        `http://localhost:8080/reservations/admin/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!res.ok) {
        error = "Failed to delete reservation.";
        return;
      }

      // Optimistic update
      reservations = reservations.filter(r => r.id !== id);
    } catch (err) {
      console.error(err);
      error = "Server error while deleting reservation.";
    }
  }

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    if ($isLoggedIn && currentUser?.role === "ADMIN") {
      await loadReservations();

      initReservationSocket({
        onCreated: () => loadReservations(),
        onUpdated: () => loadReservations(),
        onDeleted: ({ id }) => {
          reservations = reservations.filter(r => r.id !== id);
        }
      });
    }
  });

  onDestroy(() => {
    destroyReservationSocket();
  });
</script>

<main class="admin-reservations-page">
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p style="color:red">You must be logged in.</p>

  {:else if currentUser.role !== "ADMIN"}
    <p style="color:red">You are not authorized to view this page.</p>

  {:else}
    <h1>Active Reservations</h1>

    {#if error}
      <p style="color:red">{error}</p>
    {/if}

    {#if reservations.length === 0}
      <p>No active reservations.</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Movie</th>
            <th>Showtime</th>
            <th>Seats</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {#each reservations as r}
            <tr>
              <td>{r.id}</td>
              <td>{r.username}</td>
              <td>{r.title}</td>
              <td>{r.show_datetime}</td>
              <td>{r.seats}</td>
              <td>
                <button on:click={() => deleteReservation(r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/if}
</main>
