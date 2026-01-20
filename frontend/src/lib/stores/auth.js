import { writable } from "svelte/store";

export const authUser = writable(null);
export const isLoggedIn = writable(false);

//matches backend endpoint
export async function fetchMe() {
    try {
        const res = await fetch("http://localhost:8080/auth/me", {
            credentials: "include"
        });

        if (!res.ok) {
            authUser.set(null);
            isLoggedIn.set(false);
            return;
        }

        const data = await res.json();
        authUser.set(data.user);
        isLoggedIn.set(true);
    } catch (err) {
        console.error("Failed to fetch session:", err);
        authUser.set(null);
        isLoggedIn.set(false);
    }
}
