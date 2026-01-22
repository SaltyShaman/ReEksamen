<script>
  import { onMount } from "svelte";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { seats, loadSeatsForHall, initSeatSocket } from "$lib/stores/seats.js";

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

<main>
  {#if !authChecked}
    <p>Checking authentication...</p>
  {:else if !$isLoggedIn}
    <p>You must log in to view this page.</p>
  {:else}
    <h1>Seats in Hall {hallId}</h1>

    {#if errorMessage}<p style="color:red">{errorMessage}</p>{/if}

    <table>
      <thead>
        <tr>
          <th>Seat #</th>
          <th>Status</th>
          {#if currentUser.role === "ADMIN"}<th>Actions</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each $seats[hallId] ?? [] as seat}
        <tr>
          <td>{seat.seat_number}</td>
          <td>{seat.status}</td>
          {#if currentUser.role === "ADMIN"}
            <td>
              <button on:click={() => updateSeat(seat)}>Change Status</button>
            </td>
          {/if}
        </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
