"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { User } from 'firebase/auth';

import CreateShineForm from '@/components/Shines/CreateShineForm';
import ShineFeed from '@/components/Shines/ShineFeed';
import QuoteModal from "@/components/Quotes/QuoteModal";

import styles from './FeedPage.module.css';
import Navbar from '@/components/Navbar/Navbar';
import { useAuthContext } from '@/hooks/authProvider';
import { ShineData } from '@/lib/firebase/interfaces';
import { saveShineFeedToCache, loadShineFeedFromCache } from '@/hooks/feedCache';

interface DailyQuoteData {
    Quote: string;
    Author: string;
}

interface LoginFlowResponse {
    dailyQuote?: DailyQuoteData;
    isNewQuote: boolean;
}

export default function FeedPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const [quote, setQuote] = useState<DailyQuoteData | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
    
    // STATE FOR SHINE FEED
    const [shines, setShines] = useState<ShineData[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastShineId, setLastShineId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    
    // NEW: Add a state variable to track the initial data fetch
    // const [hasInitialFetched, setHasInitialFetched] = useState(false);
    const hasInitialFetched = useRef(false)

    // This function will always perform a network request
    const fetchShinesFromBackend = useCallback(async (startAfterId?: string) => {
        setIsLoadingFeed(true);
        setError(null);

        if (!user) {
            setIsLoadingFeed(false);
            return;
        }

        try {
            const idToken = await user.getIdToken();
            const response = await axios.get(`http://localhost:8080/api/shines`, {
                params: {
                    limit: 10,
                    startAfter: startAfterId,
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });

            const data: ShineData[] = response.data;
            setShines(prevShines => {
                const newShines = startAfterId ? [...prevShines, ...data] : data;
                
                const unique = Array.from(new Map(
                    newShines
                        .filter((s): s is ShineData & { id: string } => typeof s.id === 'string')
                        .map(s => [s.id, s])
                ).values());
                
                saveShineFeedToCache(unique);
                return unique;
            });

            setLastShineId(data.length > 0 ? data[data.length - 1].id : undefined);
            setHasMore(data.length === 10);
            
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                console.error("Error fetching shines:", err.response?.data || err.message);
                setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch shines.');
            } else {
                console.error("Error fetching shines:", err);
                setError(err.message || 'Could not load shines.');
            }
        } finally {
            setIsLoadingFeed(false);
        }
    }, [user]);

    // This effect runs once on mount to check the cache and then perform the first fetch.
    useEffect(() => {
        if (!user || hasInitialFetched.current) {
            return;
        }

        const cachedShines = loadShineFeedFromCache();
        
        if (cachedShines && cachedShines.length > 0) {
            console.log("Loading shines from cache.");
            setShines(cachedShines);
            const lastId = cachedShines[cachedShines.length - 1].id;
            setLastShineId(lastId);
            setHasMore(true);
            setIsLoadingFeed(false);
            hasInitialFetched.current = true // Mark as fetched
        } else {
            console.log("Cache is empty or stale, fetching from backend.");
            // If no cache, perform the initial fetch from the backend
            fetchShinesFromBackend(undefined);
            hasInitialFetched.current = true; // Mark as fetched
        }
        
    }, [user, fetchShinesFromBackend]);


    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 500 &&
            !isLoadingFeed &&
            hasMore
        ) {
            fetchShinesFromBackend(lastShineId);
        }
    }, [isLoadingFeed, hasMore, lastShineId, fetchShinesFromBackend]);

    // Add and remove scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Handler for new shines posted from the CreateShineForm
    const handleShinePosted = (newShine: ShineData) => {
        setShines(prevShines => {
            const updatedShines = [newShine, ...prevShines];
            saveShineFeedToCache(updatedShines); 
            return updatedShines;
        });
    };

    const handleShineUpdated = (updatedShine: ShineData) => {
        setShines(prevShines => {
            const updatedList = prevShines.map(shine => {
                if (shine.id === updatedShine.id) {
                    return updatedShine;
                }
                return shine;
            });
            saveShineFeedToCache(updatedList);
            return updatedList;
        });
    };

    const handleShineDeleted = (shineId: string) => {
        setShines(prevShines => {
            const updatedList = prevShines.filter(shine => shine.id !== shineId);
            saveShineFeedToCache(updatedList);
            return updatedList;
        });
    };

    const fetchQuote = async (user: User) => {
        try {
            const idToken = await user.getIdToken();
            const response = await axios.post<LoginFlowResponse>(
                `http://localhost:8080/api/user/login`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    }
                }
            );

            const data = response.data;
            if (data.isNewQuote && data.dailyQuote) {
                setQuote(data.dailyQuote);
                setShowQuoteModal(true);
            }
        } catch (err: any) {
            console.error("Failed to fetch new quote:", err.response?.data || err.message);
        }
    };

    useEffect(() => {
        if (user && !authLoading) {
            fetchQuote(user);
        }
    }, [user, authLoading]);

    const handleCloseModal = () => {
        setShowQuoteModal(false);
    };

    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
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
                    <ShineFeed
                        user={user}
                        shines={shines}
                        isLoadingFeed={isLoadingFeed}
                        error={error}
                        hasMore={hasMore}
                        onShineUpdated={handleShineUpdated}
                        onShineDeleted={handleShineDeleted}
                    />
                </>
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to share your shines!</p>
                </div>
            )}
            {showQuoteModal && quote && (
                <QuoteModal quote={quote} onClose={handleCloseModal} />
            )}
        </div>
    );
}
