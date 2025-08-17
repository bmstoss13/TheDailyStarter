// src/hooks/useAuth.ts
"use client"; // This remains, indicating client-side execution

import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // <-- Correctly import from your client-side Firebase setup

export function useAuth(): {
    user: User | null;
    loading: boolean;
    error: Error | null;
} {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // onAuthStateChanged takes the client-side auth instance as its first argument
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => { // Renamed 'user' to 'currentUser' to avoid confusion with state variable
                setUser(currentUser);
                setLoading(false);
                setError(null); // Clear any previous errors on successful state change
            },
            (authError) => { // Renamed 'error' to 'authError'
                console.error("Auth state change error:", authError);
                setError(authError);
                setLoading(false);
            }
        );

        // Cleanup function to unsubscribe when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount

    return { user, loading, error };
}
