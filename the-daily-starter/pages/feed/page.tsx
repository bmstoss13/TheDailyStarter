// pages/feed.tsx

import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { useAuth } from "@/hooks/useAuth";

import CreateShineForm from '@/components/Shines/CreateShineForm';
import ShineFeed from '@/components/Shines/ShineFeed';

import styles from './FeedPage.module.css';

export default function FeedPage() {
    const { user, loading: authLoading, error: authError } = useAuth();    
    // State to trigger a refresh of the ShineFeed
    const [shineFeedKey, setShineFeedKey] = useState(0); 

    // Callback function to be passed to CreateShineForm
    const handleShinePosted = () => {
        // Increment the key to force ShineFeed to remount/re-fetch
        setShineFeedKey(prevKey => prevKey + 1);

    };

    if (authLoading) {
        return (
            <div className={styles.feedContainer}>
                <h1>Feed</h1>
                <p>Loading user session...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div className={styles.feedContainer}>
                <h1>Feed</h1>
                <p className={styles.errorMessage}>Error loading user session: {authError.message}</p>
                <p>Please try refreshing the page or logging in again.</p>
            </div>
        );
    }

    return (
        <div className={styles.feedContainer}>
            <h1>Shine Feed </h1>

            {user ? (
                // Pass the handleShinePosted function to the CreateShineForm component
                <CreateShineForm onShinePosted={handleShinePosted} />
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to share your shines!</p>
                </div>
            )}
            <ShineFeed key={shineFeedKey} /> 
        </div>
    );
}
