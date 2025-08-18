"use client";

import { useState, useEffect } from "react";
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged } from "firebase/auth";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import styles from "./index.module.css";

export default function Home() {
  const [quote, setQuote] = useState<{ q: string; a: string } | null>(null);
  const { user, loading, error } = useAuth();

  useEffect(() => {
    if (user) {
      fetch("/api/daily-quote/quote")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch quote");
          return res.json();
        })
        .then(setQuote)
        .catch((err) => console.error("Quote fetch error:", err));
    }
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.appHeader}>Sunshine</h1>
      
      {!user ? (
        <div className={styles.authContainer}>
          <AuthForm />
        </div>
      ) : (
        <div className={styles.contentContainer}>
          {quote && (
            <div className={styles.quoteContainer}>
              <p className={styles.quoteText}>{quote.q}</p>
              <p className={styles.quoteAuthor}>— {quote.a}</p>
            </div>
          )}
          <button
            className={styles.logoutButton}
            onClick={() => auth.signOut()}
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}
