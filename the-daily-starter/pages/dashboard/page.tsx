import { getAuth } from "firebase/auth";

    async function deleteOwnAccount() {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();

        const res = await fetch("/api/deleteUser", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uid: auth.currentUser?.uid }),
        });

        return res.json();
    }