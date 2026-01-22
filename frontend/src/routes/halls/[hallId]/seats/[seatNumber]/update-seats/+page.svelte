<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { initSeatSocket, loadSeat } from "$lib/stores/seats.js";

  let hallId;
  let seatNumber;
  let seat = null;
  let currentStatus = "";
  let newStatus = "";
  let errorMessage = "";
  let successMessage = "";

  // Subscribe to $page params safely
  let unsubscribe;
  onMount(() => {
    unsubscribe = page.subscribe(($page) => {
      const hId = Number($page.params.hallId);
      const sNum = Number($page.params.seatNumber);

      // Only update if values are valid numbers
      if (!isNaN(hId) && !isNaN(sNum)) {
        hallId = hId;
        seatNumber = sNum;

        loadSeatData(); // load seat data whenever params are ready
      }
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  });

  async function loadSeatData() {
    errorMessage = "";
    seat = null;

    try {
      initSeatSocket();

      seat = await loadSeat(hallId, seatNumber);

      currentStatus = seat.status;
      newStatus = seat.status;
    } catch (err) {
      console.error(err);
      errorMessage = err.message || "Failed to load seat";
    }
  }

  async function updateSeatStatus() {
    if (!seat) return;

    errorMessage = "";
    successMessage = "";

    try {
      const res = await fetch(
        `http://localhost:8080/seats/halls/${hallId}/seats/${seatNumber}/status`,
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

      setTimeout(() => goto(`/halls/${hallId}/seats`), 2000);
    } catch (err) {
      console.error(err);
      errorMessage = "Server error while updating seat";
    }
  }
</script>

<main>
  <h1>Update Seat #{seatNumber} Status</h1>

  {#if errorMessage}
    <p style="color:red">{errorMessage}</p>
  {/if}

  {#if successMessage}
    <p style="color:green">{successMessage}</p>
  {/if}

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

    <div>
      <button on:click={updateSeatStatus}>Update</button>
      <button on:click={() => goto(`/halls/${hallId}/seats`)}>Cancel</button>
    </div>
  {:else if !errorMessage}
    <p>Loading seat information...</p>
  {/if}
</main>
