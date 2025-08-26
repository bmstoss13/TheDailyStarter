"use client";

import React, { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { CurrentUserModalData, ShineData, ShineDataWithRayStatus } from '@/lib/firebase/interfaces';
import ShineCard from './ShineCard';
import SettingsModal from '@/components/Shines/Settings/SettingsModal';
import axios from 'axios';
import styles from './ShineFeed.module.css';

interface ShineFeedProps {
    user: User | null;
    shines: ShineDataWithRayStatus[]; // Corrected type to match parent component
    isLoadingFeed: boolean;
    error: string | null;
    hasMore: boolean;
    // The component now accepts these handler props
    onShineUpdated: (shine: ShineDataWithRayStatus) => void;
    onShineDeleted: (shineId: string) => void;
}

export default function ShineFeed({ user, shines, isLoadingFeed, error, hasMore, onShineUpdated, onShineDeleted }: ShineFeedProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State now uses the correct type
    const [selectedShine, setSelectedShine] = useState<ShineDataWithRayStatus | null>(null);

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

            const hasRayed = response.data;
            console.log("has rayed:" + hasRayed);
            const originalShine = shines.find(s => s.id === shineId);
            if(originalShine) {
                const newRayCount = hasRayed ? originalShine.rayCount + 1 : originalShine.rayCount - 1
                console.log("new ray count: " + newRayCount);
                const updatedShine: ShineDataWithRayStatus = {
                    ...originalShine,
                    rayCount: newRayCount,
                    hasRayed: hasRayed,
                }
                onShineUpdated(updatedShine);
            }

        } catch (err) {
            console.error("Failed to toggle ray:", err);
        }
    }, [user, onShineUpdated]);

    const handleSettingsClick = useCallback((shine: ShineDataWithRayStatus) => {
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

            onShineDeleted(selectedShine.id ? selectedShine.id : '');

        } catch (err) {
            console.error("Failed to delete shine:", err);
        } finally {
            handleCloseModal();
        }
    }, [selectedShine, user, handleCloseModal, onShineDeleted]);
    
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
