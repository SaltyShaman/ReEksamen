<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { seats, loadSeatsForHall, initSeatSocket } from "$lib/stores/seats.js";

  let hallId;
  let seatId;
  let seat;
  let currentStatus = "";
  let newStatus = "";
  let errorMessage = "";
  let successMessage = "";

  // Reactive assignment from $page.params
  $: hallId = $page.params.hallId;
  $: seatId = $page.params.seatId;

  // Reactive: fetch seat whenever hallId & seatId are available
  $: if (hallId && seatId) {
    loadSeat();
  }

  async function loadSeat() {
    errorMessage = "";
    try {
      initSeatSocket(); // init socket if not already

      await loadSeatsForHall(hallId);

      // Get the specific seat from the store
      const unsubscribe = seats.subscribe(allSeats => {
        seat = allSeats[hallId]?.find(s => s.id == seatId);
        if (seat) {
          currentStatus = seat.status;
          newStatus = seat.status;
        }
      });

      // Cleanup subscription after one tick
      setTimeout(() => unsubscribe(), 0);

      if (!seat) {
        errorMessage = "Seat not found";
      }
    } catch (err) {
      console.error(err);
      errorMessage = "Server error while loading seat";
    }
  }

  async function updateSeatStatus() {
    if (!seat) return;

    try {
      const res = await fetch(
        `http://localhost:8080/seats/halls/${hallId}/seats/${seatId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        errorMessage = data.error || "Failed to update seat";
        return;
      }

      successMessage = data.message;

      // Redirect after update
      setTimeout(() => goto(`/halls/${hallId}/seats`), 2000);

    } catch (err) {
      console.error(err);
      errorMessage = "Server error while updating seat";
    }
  }
</script>

<main>
  <h1>Update Seat #{seatId} Status</h1>

  {#if errorMessage}<p style="color:red">{errorMessage}</p>{/if}
  {#if successMessage}<p style="color:green">{successMessage}</p>{/if}

  {#if seat}
    <p>Current Status: <b>{currentStatus}</b></p>

    <label>
      New Status:
      <select bind:value={newStatus}>
        <option value="AVAILABLE">AVAILABLE</option>
        <option value="BROKEN">BROKEN</option>
        <option value="MAINTENANCE">MAINTENANCE</option>
      </select>
    </label>

    <button on:click={updateSeatStatus}>Update</button>
    <button on:click={() => goto(`/halls/${hallId}/seats`)}>Cancel</button>
  {:else if !errorMessage}
    <p>Loading seat information...</p>
  {/if}
</main>
