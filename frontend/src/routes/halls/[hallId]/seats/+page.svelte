<script>
  import { onMount } from "svelte";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { seats, loadSeatsForHall, initSeatSocket } from "$lib/stores/seats.js";
  import "./seat-admin.css";

  let currentUser = null;
  let authChecked = false;
  let errorMessage = "";
  let hallId;

  // ✅ match new folder param
  $: hallId = Number($page.params.hallId);

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    try {
      initSeatSocket(); // connect to seat socket
      await loadSeatsForHall(hallId); // fetch seats for this hall
    } catch (err) {
      console.error(err);
      errorMessage = err.message || "Server error while loading seats";
    }
  });

  function updateSeat(seat) {
    goto(`/halls/${hallId}/seats/${seat.seat_number}/update-seats`);
  }
</script>

<main class="seat-admin-page">
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p class="error">You must log in to view this page.</p>

  {:else}
    <div class="seat-header">
      <h1>Seats in Hall {hallId}</h1>

      <button
        class="secondary"
        on:click={() => goto("/halls")}
      >
        ← Back to Halls
      </button>
    </div>

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}

    <div class="table-wrapper">
      <table class="seat-table">
        <thead>
          <tr>
            <th>Seat #</th>
            <th>Status</th>
            {#if currentUser.role === "ADMIN"}
              <th>Actions</th>
            {/if}
          </tr>
        </thead>

        <tbody>
          {#each $seats[hallId] ?? [] as seat}
          <tr>
            <td>{seat.seat_number}</td>

            <td>
              <span class={`status ${seat.status.toLowerCase()}`}>
                {seat.status}
              </span>
            </td>

            {#if currentUser.role === "ADMIN"}
              <td>
                <button
                  class="primary"
                  on:click={() => updateSeat(seat)}
                >
                  Change Status
                </button>
              </td>
            {/if}
          </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</main>