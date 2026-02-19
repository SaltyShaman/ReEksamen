<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { initSeatSocket, loadSeat } from "$lib/stores/seats.js";
  import { authUser, isLoggedIn, fetchMe } from "$lib/stores/auth.js";
  import "./seat-update.css";

  let hallId;
  let seatNumber;
  let seat = null;
  let currentStatus = "";
  let newStatus = "";
  let errorMessage = "";
  let successMessage = "";

  let currentUser = null;
  let authChecked = false;

  // ✅ Subscribe to $page params reactively
  $: hallId = Number($page.params.hallId);
  $: seatNumber = Number($page.params.seatNumber);

  onMount(async () => {
    // 1️⃣ Fetch current user info
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    // 2️⃣ Redirect if not logged in
    if (!$isLoggedIn) return;

    // 3️⃣ Redirect if not admin
    if (currentUser.role !== "ADMIN") return;

    // 4️⃣ Load seat data
    await loadSeatData();
  });

  async function loadSeatData() {
    errorMessage = "";
    seat = null;

    if (isNaN(hallId) || isNaN(seatNumber)) {
      errorMessage = "Invalid hall or seat number.";
      return;
    }

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

      // Redirect back to seat list after 2 seconds
      setTimeout(() => goto(`/halls/${hallId}/seats`), 2000);
    } catch (err) {
      console.error(err);
      errorMessage = "Server error while updating seat";
    }
  }
</script>
<main class="seat-update-page">
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p class="error">You must log in to view this page.</p>

  {:else if currentUser.role !== "ADMIN"}
    <p class="error">You are not authorized to view this page.</p>

  {:else}
    <div class="seat-update-card">
      <h1>Update Seat #{seatNumber}</h1>

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      {#if successMessage}
        <p class="success">{successMessage}</p>
      {/if}

      {#if seat}
        <div class="seat-info">
          <p>
            Current Status:
            <span class={`status ${currentStatus.toLowerCase()}`}>
              {currentStatus}
            </span>
          </p>
        </div>

        <div class="form-group">
          <label>New Status</label>
          <select bind:value={newStatus}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BROKEN">BROKEN</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="primary" on:click={updateSeatStatus}>
            Update Status
          </button>

          <button
            class="secondary"
            on:click={() => goto(`/halls/${hallId}/seats`)}
          >
            Cancel
          </button>
        </div>
      {:else if !errorMessage}
        <p>Loading seat information...</p>
      {/if}
    </div>
  {/if}
</main>
