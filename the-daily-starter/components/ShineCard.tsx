"use client";

import React, { useState } from 'react';
import { auth } from '@/lib/firebase/firebase';
import styles from './ShineCard.module.css';
// Import ShineData from your actual interfaces file
import { ShineData } from '@/lib/firebase/interfaces';

interface ShineCardProps {
  shine: ShineData & { hasRayed?: boolean }; // Extend ShineData to include hasRayed from API if needed
  onRayToggle: (shineId: string, newRayCount: number, hasRayed: boolean) => void;
}

export default function ShineCard({ shine, onRayToggle }: ShineCardProps) {
  const [currentRayCount, setCurrentRayCount] = useState(shine.rayCount);
  // Initialize from prop, default to false if not provided by API
  const [hasUserRayed, setHasUserRayed] = useState(shine.hasRayed || false);
  const [isRaying, setIsRaying] = useState(false);

  // Format timestamp (now handling Firestore Timestamp objects)
  const formatTimestamp = (timestamp: any) => { // 'any' because it could be Timestamp or Date from JSON serialization
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') { // It's a Firestore Timestamp object
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) { // It's already a JS Date object
      date = timestamp;
    } else if (typeof timestamp === 'object' && timestamp.hasOwnProperty('_seconds') && timestamp.hasOwnProperty('_nanoseconds')) {
      // It's a plain object representation from JSON.parse (e.g. from API route stringify/parse)
      date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
    }
    
    if (date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Just now';
  };

  const handleRayToggle = async () => {
    if (isRaying) return;
    setIsRaying(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in to Ray a shine.");
      setIsRaying(false);
      return;
    }

    const idToken = await currentUser.getIdToken();

    // Optimistic UI update
    const newRayCount = hasUserRayed ? currentRayCount - 1 : currentRayCount + 1;
    setHasUserRayed(!hasUserRayed);
    setCurrentRayCount(newRayCount);

    try {
      const response = await fetch(`/api/shines/${shine.id}/toggleRay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        setHasUserRayed(!hasUserRayed);
        setCurrentRayCount(currentRayCount);
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to toggle Ray.');
      }

      // `response.json()` for toggleRay typically returns { rayToggled: boolean }
      // This is passed to onRayToggle to propagate the change up
      onRayToggle(shine.id!, newRayCount, !hasUserRayed); // Use shine.id! assuming it's always there

    } catch (err: any) {
      console.error("Error toggling Ray:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsRaying(false);
    }
  };

  return (
    <div className={styles.shineCard}>
      <div className={styles.shineHeader}>
        {/* Use shine.userPhotoUrl as per your interface */}
        {shine.userPhotoUrl && (
          <img src={shine.userPhotoUrl} alt={shine.username} className={styles.userPhoto} />
        )}
        <div className={styles.userInfo}>
          <span className={styles.username}>{shine.username}</span>
          {/* Use shine.createdAt as per your interface */}
          <span className={styles.timestamp}>{formatTimestamp(shine.createdAt)}</span>
        </div>
      </div>
      <p className={styles.shineText}>{shine.text}</p>
      {shine.mediaURL && (
        <div className={styles.mediaContainer}>
          <img src={shine.mediaURL} alt="Shine media" className={styles.media} />
        </div>
      )}
      <div className={styles.shineFooter}>
        <button
          className={`${styles.rayButton} ${hasUserRayed ? styles.rayed : ''}`}
          onClick={handleRayToggle}
          disabled={isRaying}
        >
          {hasUserRayed ? '✨ Rayed!' : '✨ Ray'} ({currentRayCount})
        </button>
      </div>
    </div>
  );
}
