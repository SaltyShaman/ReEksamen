<script>

    let errorMessage = "";
    let successMessage = "";

    async function deleteAccount() {
        
        if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

        try{

            const res = await fetch ("http://localhost:8080/users/me", {

                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                     errorMessage = data.error || "Delete failed";
            return;
            }


        successMessage = data.message;

        setTimeout(() => {
                window.location.href = "/login";
        }, 3000); 

        } catch {
            errorMessage = "Server error";
        }
    }
</script>

<button on:click={deleteAccount} class="danger">
    Delete My Account
</button>

{#if errorMessage}<p class="error">{errorMessage}</p>{/if}
{#if successMessage}<p class="success">{successMessage}</p>{/if}