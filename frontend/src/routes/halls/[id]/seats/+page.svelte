<script>
  import { onMount } from "svelte";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  
  let currentUser = null;
  let authChecked = false;
  let errorMessage = "";
  let seats = [];

  const hallId = $page.params.id;

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    try {
      const res = await fetch(`http://localhost:8080/seats/halls/${hallId}/seats`, {
        credentials: "include"
      });
      const data = await res.json();

      if (!res.ok) {
        errorMessage = data.error || "Failed to load seats";
        return;
      }

      seats = data.seats;
    } catch (err) {
      console.error(err);
      errorMessage = "Server error while loading seats";
    }
  });

  function updateSeat(seatId) {
    goto(`/halls/${hallId}/seats/${seatId}/update-seats`);
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
        {#each seats as seat}
          <tr>
            <td>{seat.seat_number}</td>
            <td>{seat.status}</td>
            {#if currentUser.role === "ADMIN"}
              <td><button on:click={() => updateSeat(seat.id)}>Change Status</button></td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
