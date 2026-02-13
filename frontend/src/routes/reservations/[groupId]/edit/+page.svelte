<script>
  import "./edit-reservation.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { fetchMe, authUser, isLoggedIn } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";

  let groupId;
  let authChecked = false;
  let currentUser = null;
  let error = "";
  let loading = false;

  let showtimeId = null;
  let seats = [];
  let selectedSeats = [];

  /* ---------------- LOAD RESERVATION ---------------- */
  async function loadReservation() {
    try {
      const res = await fetch(
        "http://localhost:8080/reservations/my?type=active",
        { credentials: "include" }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      const reservation = data.reservations.find(
        r => r.reservationGroupId == groupId
      );

      if (!reservation) {
        error = "Reservation not found.";
        return;
      }

      showtimeId = reservation.showtime_id;

      selectedSeats = reservation.seatIds
        ? reservation.seatIds.split(",").map(id => Number(id))
        : [];

      await loadSeats(showtimeId);

    } catch (err) {
      console.error(err);
      error = "Failed to load reservation.";
    }
  }

  /* ---------------- LOAD SEATS (FIXED) ---------------- */
  async function loadSeats(id) {
    try {
      const res = await fetch(
        `http://localhost:8080/reservations/showtimes/${id}/seats?groupId=${groupId}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      seats = data.seats ?? [];

    } catch (err) {
      console.error(err);
      error = "Failed to load seats.";
    }
  }

  /* ---------------- TOGGLE SEAT ---------------- */
  function toggleSeat(seatId) {
    if (selectedSeats.includes(seatId)) {
      selectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      selectedSeats = [...selectedSeats, seatId];
    }
  }

  /* ---------------- UPDATE RESERVATION ---------------- */
  async function updateReservation() {
    error = "";

    if (selectedSeats.length === 0) {
      error = "Select at least one seat.";
      return;
    }

    try {
      loading = true;

      const res = await fetch(
        `http://localhost:8080/reservations/${groupId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            seatIds: selectedSeats
          })
        }
      );

      if (!res.ok) throw new Error();

      goto("/dashboard");

    } catch (err) {
      console.error(err);
      error = "Failed to update reservation.";
    } finally {
      loading = false;
    }
  }

  /* ---------------- INIT ---------------- */
  onMount(async () => {
    groupId = $page.params.groupId;

    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    if ($isLoggedIn) {
      await loadReservation();
    }
  });
</script>

<div class="edit-reservation-page">

  {#if !authChecked}
    <p class="status">Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p class="error">You must be logged in.</p>

  {:else}
    <div class="reservation-card">
      <h1>Edit Reservation</h1>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      {#if seats.length > 0}
        <div class="seat-section">
          <h3>Select Seats</h3>

          <div class="seat-grid">
            {#each seats as seat}
              <button
                class="seat 
                  {seat.status === 'RESERVED' && !selectedSeats.includes(seat.id) ? 'reserved' : ''}
                  {selectedSeats.includes(seat.id) ? 'selected' : ''}"
                disabled={
                  seat.status === "RESERVED" &&
                  !selectedSeats.includes(seat.id)
                }
                on:click={() => toggleSeat(seat.id)}
              >
                {seat.seat_number}
              </button>
            {/each}
          </div>
        </div>

        <div class="action-section">
          <p class="selected-count">
            Selected Seats: {selectedSeats.length}
          </p>

          <button
            class="primary"
            on:click={updateReservation}
            disabled={loading}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>

          <button
            class="secondary"
            on:click={() => goto("/dashboard")}
          >
            Cancel
          </button>
        </div>
      {/if}
    </div>

  {/if}
</div>
