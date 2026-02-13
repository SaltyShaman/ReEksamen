<script>
  import "./create-reservation.css";
  import { onMount } from "svelte";
  import { fetchMe, authUser, isLoggedIn } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";

  let movies = [];
  let showtimes = [];
  let seats = [];

  let selectedMovie = "";
  let selectedShowtime = "";
  let selectedSeats = [];

  let authChecked = false;
  let currentUser = null;
  let error = "";
  let loading = false;

  async function loadMovies() {
    try {
      const res = await fetch("http://localhost:8080/movies");
      if (!res.ok) throw new Error();
      const data = await res.json();
      movies = data.movies ?? [];
    } catch {
      error = "Failed to load movies.";
    }
  }

    async function loadShowtimes(movieId) {
        selectedShowtime = "";
        seats = [];
        selectedSeats = [];
        showtimes = [];
        error = "";

        if (!movieId) return;

        try {
        const res = await fetch(
            `http://localhost:8080/showtimes/movie/${movieId}`
            );
            if (!res.ok) throw new Error();

            const data = await res.json();
            showtimes = data.showtimes ?? [];

        } catch {
            error = "Failed to load showtimes.";
        }
    }


  async function loadSeats(showtimeId) {
    selectedSeats = [];

    if (!showtimeId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/reservations/showtimes/${showtimeId}/seats`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      seats = data.seats ?? [];
    } catch {
      error = "Failed to load seats.";
    }
  }

  function toggleSeat(seatId) {
    if (selectedSeats.includes(seatId)) {
      selectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      selectedSeats = [...selectedSeats, seatId];
    }
  }

  async function createReservation() {
    error = "";

    if (!selectedShowtime || selectedSeats.length === 0) {
      error = "Select showtime and at least one seat.";
      return;
    }

    try {
      loading = true;

      const res = await fetch("http://localhost:8080/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          showtimeId: Number(selectedShowtime),
          seatIds: selectedSeats
        })
      });

      if (!res.ok) throw new Error();

      goto("/dashboard");
    } catch {
      error = "Failed to create reservation.";
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchMe();
    currentUser = $authUser;
    authChecked = true;

    if ($isLoggedIn) {
      await loadMovies();
    }
  });
</script>

<main class="create-reservation-page">
  {#if !authChecked}
    <p>Checking authentication...</p>

  {:else if !$isLoggedIn}
    <p class="error">You must be logged in.</p>

  {:else}
    <div class="reservation-card">
      <h1>Create Reservation</h1>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <!-- Movie -->
      <div class="form-group">
        <label>Movie</label>
        <select
          bind:value={selectedMovie}
          on:change={(e) => loadShowtimes(e.target.value)}
        >
          <option value="">Select movie</option>
          {#each movies as movie}
            <option value={movie.id}>{movie.title}</option>
          {/each}
        </select>
      </div>

      <!-- Showtime -->
      {#if showtimes.length > 0}
        <div class="form-group">
          <label>Showtime</label>
          <select
            bind:value={selectedShowtime}
            on:change={(e) => loadSeats(e.target.value)}
          >
            <option value="">Select showtime</option>
            {#each showtimes as s}
              <option value={s.id}>
                {new Date(s.show_datetime).toLocaleString()}
              </option>
            {/each}
          </select>
        </div>
      {/if}

        {#if selectedMovie && showtimes.length === 0}
        <p class="info-message">
             No upcoming showtimes available for this movie.
        </p>
        {/if}

      <!-- Seats -->
      {#if seats.length > 0}
        <div class="seats-section">
          <h3>Select Seats</h3>

          <div class="seat-grid">
            {#each seats as seat}
              <button
                class="seat
                  {seat.status === 'RESERVED' ? 'reserved' : ''}
                  {selectedSeats.includes(seat.id) ? 'selected' : ''}"
                disabled={seat.status === "RESERVED"}
                on:click={() => toggleSeat(seat.id)}
              >
                {seat.seat_number}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Confirm -->
      {#if selectedSeats.length > 0}
        <div class="confirm-box">
          <p><strong>Selected Seats:</strong> {selectedSeats.length}</p>

          <button on:click={createReservation} disabled={loading}>
            {loading ? "Creating..." : "Confirm Reservation"}
          </button>
        </div>
      {/if}
    </div>
  {/if}
</main>
