"use client";

import { useState, useEffect } from "react";
import { auth } from '@/lib/firebase/firebase';
import { useRouter } from 'next/router'; // Import useRouter
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import styles from "./index.module.css";

interface DailyQuoteData {
  q: string;
  a: string;
}

export default function Home() {
  const [quote, setQuote] = useState<DailyQuoteData | null>(null);
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    if (user) {
      // User is logged in
      // 1. Fetch daily quote (as you already do)
      fetch("/api/daily-quote/quote")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(setQuote)
        .catch((err) => {
          console.error("Quote fetch error:", err);
          setQuote(null);
        });

      // 2. OPTIONAL: Automatically redirect to FeedPage after login
      // This is a common pattern if the homepage serves mainly as a login portal.
      // If you want them to land on the homepage first, remove this.
      // For now, let's add it as an option.
      // router.push('/feed'); // Uncomment this line if you want immediate redirect

    } else {
      // User is NOT logged in
      setQuote(null); // Clear quote if user logs out
    }
  }, [user, router]); // Add router to dependency array for useEffect

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading user session...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className={styles.errorContainer}>
        <h2>Authentication Error</h2>
        <p>{authError.message}</p>
        <p>Please try refreshing the page or logging in again.</p>
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
          {quote ? (
            <div className={styles.quoteContainer}>
              <p className={styles.quoteText}>{quote.q}</p>
              <p className={styles.quoteAuthor}>— {quote.a}</p>
            </div>
          ) : (
            <p>Loading daily quote...</p>
          )}

          {/* New: Button to navigate to the Feed Page */}
          <button
            className={styles.feedButton} // Add this class to your index.module.css
            onClick={() => router.push('/feed/page')}
          >
            Go to Shines Feed
          </button>

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
