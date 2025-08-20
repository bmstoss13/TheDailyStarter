"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase/firebase'; // Client-side Auth
import { ShineData } from '@/lib/firebase/interfaces';
import ShineCard from './ShineCard';
import CreateShineForm from './CreateShineForm'; // Import the form
import styles from './ShineFeed.module.css';

export default function ShineFeed() {
  const [shines, setShines] = useState<ShineData[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastShineId, setLastShineId] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const fetchShines = useCallback(async (startAfterId?: string) => {
    setIsLoadingFeed(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // User not logged in, fetch shines without auth token
        // You might want to handle this by redirecting or showing a login prompt
        // For now, fetch will likely fail or return limited data depending on rules
        console.warn("No current user. Fetching shines without authorization.");
      }

      const idToken = currentUser ? await currentUser.getIdToken() : undefined;

      let url = `/api/shines/shines?limit=10`; // Fetch 10 shines at a time
      if (startAfterId) {
        url += `&startAfter=${startAfterId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` }), // Include token if available
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch shines.');
      }

      setShines((prevShines) => [...prevShines, ...data]);
      setLastShineId(data.length > 0 ? data[data.length - 1].id : undefined);
      setHasMore(data.length === 10); // If we got less than limit, there are no more

    } catch (err: any) {
      console.error("Error fetching shines:", err);
      setError(err.message || "Could not load shines.");
    } finally {
      setIsLoadingFeed(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    // Listen for auth state changes to re-fetch shines with auth context
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // Only fetch if it's the initial load or user just logged in/out
      if (user || !user && shines.length === 0) { // Fetch initially or if user logs out and feed is empty
        setShines([]); // Clear current shines
        setLastShineId(undefined); // Reset pagination
        setHasMore(true); // Assume there's more until proven otherwise
        fetchShines();
      }
    });

    // Initial fetch if user is already logged in or no auth state change listener runs for some reason
    if (auth.currentUser) {
        fetchShines();
    } else {
        // If no user, still try to fetch (will determine if rules allow public read)
        // Or you might redirect to login if shines are strictly for logged-in users
        fetchShines();
    }


    return () => unsubscribe(); // Clean up auth listener
  }, [fetchShines]); // Depend on fetchShines

  // Function to handle infinite scrolling
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500 && !isLoadingFeed && hasMore) {
      fetchShines(lastShineId);
    }
  }, [isLoadingFeed, hasMore, lastShineId, fetchShines]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Callback for ShineCard to update specific shine's ray count
  const handleShineCardRayToggle = useCallback((shineId: string, newRayCount: number, hasRayed: boolean) => {
    setShines((prevShines) =>
      prevShines.map((shine) =>
        shine.id === shineId ? { ...shine, rayCount: newRayCount, hasRayed: hasRayed } : shine
      )
    );
  }, []);

  return (
    <div className={styles.shineFeedContainer}>
      <CreateShineForm onShinePosted={() => {
        setShines([]); // Clear current shines
        setLastShineId(undefined); // Reset pagination
        setHasMore(true); // Assume there's more until proven otherwise
        fetchShines(); // Re-fetch all shines to see the new one
      }} />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.shineList}>
        {shines.map((shine) => (
          <ShineCard key={shine.id} shine={shine} onRayToggle={handleShineCardRayToggle} />
        ))}
      </div>

      {isLoadingFeed && <p className={styles.loading}>Loading more shines...</p>}
      {!hasMore && !isLoadingFeed && shines.length > 0 && <p className={styles.endMessage}>You've seen all the shines!</p>}
      {shines.length === 0 && !isLoadingFeed && !error && <p className={styles.emptyMessage}>No shines to display yet. Be the first to post!</p>}
    </div>
  );
}
