"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { ShineData } from '@/lib/firebase/interfaces';
import ShineCard from './ShineCard';
import axios from 'axios';
import styles from './ShineFeed.module.css';

export default function ShineFeed({ user }: { user: User | null }) {
    const [shines, setShines] = useState<ShineData[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastShineId, setLastShineId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);

    const fetchShines = useCallback(async (startAfterId?: string) => {
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

            const data = response.data;
            setShines((prevShines) => {
                const all = [...prevShines, ...data];
                const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());
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

    // NEW FUNCTION for handling ray toggles
    const handleToggleRay = useCallback(async (shineId: string) => {
        if (!user) {
            setError('You must be logged in to ray a shine.');
            return;
        }

        try {
            const idToken = await user.getIdToken();
            const url = `http://localhost:8080/api/shines/${shineId}/toggleRay`;

            const response = await axios.post(url, null, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            const rayToggled = response.data;

            setShines((prevShines) =>
                prevShines.map((shine) => {
                    if (shine.id === shineId) {
                        return {
                            ...shine,
                            hasRayed: rayToggled,
                            rayCount: rayToggled ? shine.rayCount + 1 : shine.rayCount - 1,
                        };
                    }
                    return shine;
                })
            );
        } catch (err: any) {
            console.error("Failed to toggle ray:", err);
            setError("Could not toggle ray.");
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setShines([]);
            setLastShineId(undefined);
            setHasMore(true);
            fetchShines();
        } else {
            setShines([]);
            setLastShineId(undefined);
            setHasMore(true);
            setIsLoadingFeed(false);
        }
    }, [user, fetchShines]);

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

    return (
        <div className={styles.shineFeedContainer}>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.shineList}>
                {shines.map((shine) => (
                    <ShineCard
                        key={shine.id}
                        shine={shine}
                        // UPDATED PROP
                        onRayToggle={handleToggleRay}
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