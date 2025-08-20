"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase/firebase'; // Client-side Auth
import { ShineData } from '@/lib/firebase/interfaces';
import ShineCard from './ShineCard';
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
                console.warn("No current user. Fetching shines without authorization.");
            }

            const idToken = currentUser ? await currentUser.getIdToken() : undefined;

            let url = `/api/shines/shines?limit=10`;
            if (startAfterId) {
                url += `&startAfter=${startAfterId}`;
            }

            const response = await fetch(url, {
                headers: {
                'Content-Type': 'application/json',
                ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch shines.');
            }

            // Deduplicate by ID
            setShines((prevShines) => {
                const all = [...prevShines, ...data];
                const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());
                return unique;
            });

            setLastShineId(data.length > 0 ? data[data.length - 1].id : undefined);
            setHasMore(data.length === 10);
        } catch (err: any) {
            console.error("Error fetching shines:", err);
            setError(err.message || "Could not load shines.");
        } finally {
            setIsLoadingFeed(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(() => {
        setShines([]);
        setLastShineId(undefined);
        setHasMore(true);
        fetchShines();
        });

        return () => unsubscribe();
    }, [fetchShines]);

    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 500 &&
            !isLoadingFeed &&
            hasMore
        ) {
        fetchShines(lastShineId);
        }
    }, [isLoadingFeed, hasMore, lastShineId, fetchShines]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleShineCardRayToggle = useCallback(
        (shineId: string, newRayCount: number, hasRayed: boolean) => {
            setShines((prevShines) =>
                prevShines.map((shine) =>
                shine.id === shineId
                    ? { ...shine, rayCount: newRayCount, hasRayed }
                    : shine
                )
            );
        },
        []
    );

    return (
        <div className={styles.shineFeedContainer}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.shineList}>
            {shines.map((shine) => (
            <ShineCard
                key={shine.id}
                shine={shine}
                onRayToggle={handleShineCardRayToggle}
            />
            ))}
        </div>

        {isLoadingFeed && <p className={styles.loading}>Loading more shines...</p>}
        {!hasMore && !isLoadingFeed && shines.length > 0 && (
            <p className={styles.endMessage}>You've seen all the shines!</p>
        )}
        {shines.length === 0 && !isLoadingFeed && !error && (
            <p className={styles.emptyMessage}>
            No shines to display yet. Be the first to post!
            </p>
        )}
        </div>
    );
}
