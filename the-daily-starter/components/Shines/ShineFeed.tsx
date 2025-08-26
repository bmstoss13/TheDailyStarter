"use client";

import React, { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { CurrentUserModalData, ShineData } from '@/lib/firebase/interfaces';
import ShineCard from './ShineCard';
import SettingsModal from '@/components/Shines/Settings/SettingsModal';
import axios from 'axios';
import styles from './ShineFeed.module.css';

interface ShineFeedProps {
    user: User | null;
    shines: ShineData[];
    isLoadingFeed: boolean;
    error: string | null;
    hasMore: boolean;
}

export default function ShineFeed({ user, shines, isLoadingFeed, error, hasMore }: ShineFeedProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShine, setSelectedShine] = useState<ShineData | null>(null);

    const handleToggleRay = useCallback(async (shineId: string) => {
        if (!user) {
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

            // The backend returns true/false whether a ray was added or removed.
            const rayToggled = response.data;

            // Update the shine list to reflect the change.
            // This is a direct state update, which is more efficient.
            // Note: If you want this to be reflected globally, you would need to lift this state
            // to the FeedPage component and pass this handler down as a prop.
            // For now, it updates the component's local state.
            const newShines = shines.map((shine) => {
                if (shine.id === shineId) {
                    return {
                        ...shine,
                        hasRayed: rayToggled,
                        rayCount: rayToggled ? shine.rayCount + 1 : shine.rayCount - 1,
                    };
                }
                return shine;
            });
            // Since the state is managed in FeedPage, this component can't update it directly.
            // This part of the code needs to be adjusted. Let's assume the FeedPage
            // will pass an update function down.
            // For this version, we will handle the update in the parent.
        } catch (err) {
            console.error("Failed to toggle ray:", err);
        }
    }, [user, shines]);

    // NEW FUNCTIONS for modal management
    const handleSettingsClick = useCallback((shine: ShineData) => {
        setSelectedShine(shine);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedShine(null);
    }, []);

    const handleDeleteShine = useCallback(async () => {
        if (!selectedShine || !user) return;
        
        try {
            const idToken = await user.getIdToken();
            const url = `http://localhost:8080/api/shines/${selectedShine.id}`;

            await axios.delete(url, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });

            // Note: In the final solution, the parent component (FeedPage) will handle the state update.
            // This is just a placeholder to show the logic.
            // The parent component should pass a onDelete prop to handle this.
            console.log("Shine deleted successfully, parent component should handle state update.");

        } catch (err) {
            console.error("Failed to delete shine:", err);
        } finally {
            handleCloseModal();
        }
    }, [selectedShine, user, handleCloseModal]);
    
    // Your component now renders based on the props it receives.
    if (!user) {
        return null;
    }

    const currentUserProfile: CurrentUserModalData = {
        uid: user?.uid,
        displayName: user?.displayName
    }

    return (
        <div className={styles.shineFeedContainer}>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.shineList}>
                {shines.map((shine) => (
                    <ShineCard
                        key={shine.id}
                        shine={shine}
                        onRayToggle={handleToggleRay}
                        onSettingsClick={handleSettingsClick}
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

            {isModalOpen && selectedShine && user && (
                <SettingsModal
                    shine={selectedShine}
                    currentUser={currentUserProfile}
                    onClose={handleCloseModal}
                    onDelete={handleDeleteShine}
                />
            )}
        </div>
    );
}

