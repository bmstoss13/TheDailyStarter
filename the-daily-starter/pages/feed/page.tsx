// pages/feed.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";

import CreateShineForm from '@/components/Shines/CreateShineForm';
import ShineFeed from '@/components/Shines/ShineFeed';
import QuoteModal from "@/components/Quotes/QuoteModal"; // Import the QuoteModal component

import styles from './FeedPage.module.css';
import Navbar from '@/components/Navbar/Navbar';

interface DailyQuoteData {
    q: string;
    a: string;
}

export default function FeedPage() {
    const { user, loading: authLoading, error: authError } = useAuth();
    const [shineFeedKey, setShineFeedKey] = useState(0);
    const [quote, setQuote] = useState<DailyQuoteData | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);

    // This useEffect will run when the user's auth state changes
    // It will fetch the new quote and show the modal only for new logins
    useEffect(() => {
        const fetchQuote = async () => {
            if (!user) {
                return;
            }
            try {
                const response = await fetch(`/api/login-flow`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid })
                });

                if (!response.ok) {
                    throw new Error('Login flow API call failed.');
                }

                const data = await response.json();
                if (data.isNewQuote) {
                    setQuote(data.dailyQuote);
                    setShowQuoteModal(true);
                }

            } catch (err: any) {
                console.error("Failed to fetch new quote:", err);
            }
        };

        fetchQuote();
    }, [user]); // The dependency array ensures this effect runs when the 'user' object is available

    // Callback function to be passed to CreateShineForm
    const handleShinePosted = () => {
        setShineFeedKey(prevKey => prevKey + 1);
    };
    
    // Function to close the modal
    const handleCloseModal = () => {
        setShowQuoteModal(false);
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
            <Navbar/>
            {user ? (
                <>
                    <CreateShineForm onShinePosted={handleShinePosted} />
                    <ShineFeed key={shineFeedKey} />
                </>
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to share your shines!</p>
                </div>
            )}
            {/* Conditionally render the QuoteModal */}
            {showQuoteModal && quote && (
                <QuoteModal quote={quote} onClose={handleCloseModal} />
            )}
        </div>
    );
}