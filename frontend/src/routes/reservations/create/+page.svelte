<script>
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

{#if !authChecked}
  <p>Checking authentication...</p>

{:else if !$isLoggedIn}
  <p>You must be logged in.</p>

{:else}
  <h1>Create Reservation</h1>

  {#if error}
    <p>{error}</p>
  {/if}

  <div>
    <label>Movie:</label>
    <select bind:value={selectedMovie} on:change={(e) => loadShowtimes(e.target.value)}>
      <option value="">Select movie</option>
      {#each movies as movie}
        <option value={movie.id}>{movie.title}</option>
      {/each}
    </select>
  </div>

  {#if showtimes.length > 0}
    <div>
      <label>Showtime:</label>
      <select bind:value={selectedShowtime} on:change={(e) => loadSeats(e.target.value)}>
        <option value="">Select showtime</option>
        {#each showtimes as s}
          <option value={s.id}>{s.show_datetime}</option>
        {/each}
      </select>
    </div>
  {/if}

  {#if seats.length > 0}
    <div>
      <h3>Seats</h3>
      {#each seats as seat}
        <button
          disabled={seat.status === "RESERVED"}
          on:click={() => toggleSeat(seat.id)}
        >
          {seat.seat_number}
          {#if selectedSeats.includes(seat.id)}
            (Selected)
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if selectedSeats.length > 0}
    <div>
      <p>Selected Seats: {selectedSeats.length}</p>
      <button on:click={createReservation} disabled={loading}>
        {loading ? "Creating..." : "Confirm Reservation"}
      </button>
    </div>
  {/if}
{/if}
