"use client";

import React, { useState } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { ShineData } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faComment } from '@fortawesome/free-solid-svg-icons';
import { faSun as faSunRegular } from '@fortawesome/free-regular-svg-icons';
import { formatTimestamp } from '../helper';
import profile from '@/public/png-transparent-default-avatar.png';
import Image from "next/image";

import styles from './ShineCard.module.css';
import CommentCard from './Comments/CommentCard';
import CommentFeed from './Comments/CommentFeed';

interface ShineCardProps {
    shine: ShineData & { hasRayed?: boolean };
    onRayToggle: (shineId: string, newRayCount: number, hasRayed: boolean) => void;
}

export default function ShineCard({ shine, onRayToggle }: ShineCardProps) {
    const [currentRayCount, setCurrentRayCount] = useState(shine.rayCount);
    const [hasUserRayed, setHasUserRayed] = useState(shine.hasRayed || false);
    const [isRaying, setIsRaying] = useState(false);
    const [isOpeningComments, setIsOpeningComments] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

        onRayToggle(shine.id!, newRayCount, !hasUserRayed); 

        } catch (err: any) {
            console.error("Error toggling Ray:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsRaying(false);
        }
    };

    const handleCommentOpen = async () => {
        setIsLoading(true);
        if(!isOpeningComments){
            setIsOpeningComments(true);
            setIsLoading(false);
        } else {
            setIsOpeningComments(false);
            setIsLoading(false);
        }

    }

    return (
        <div className={styles.shineCard}>
            <div className={styles.shineHeader}>
                {shine.userPhotoUrl ? (
                    <img src={shine.userPhotoUrl} alt={shine.username} className={styles.userPhoto} />
                ) : (
                    <Image src={profile} alt="navbar logo" width="110" height="110" className={styles.userPhotoDefault}/>
                )}
                <div className={styles.userInfo}>
                    <span className={styles.username}>{shine.username}</span>
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
                    className={styles.commentButton}
                    onClick={handleCommentOpen}                    
                >
                    <FontAwesomeIcon
                        icon={faComment} 
                        className={styles.commentIcon}
                    />

                </button>
                <button
                    className={`${styles.rayButton} ${hasUserRayed ? styles.rayed : ''}`}
                    onClick={handleRayToggle}
                    disabled={isRaying}
                >
                    <FontAwesomeIcon
                        icon={hasUserRayed ? faSun : faSunRegular}
                        className={styles.rayIcon}                    
                    />
                </button>
            </div>
            {isOpeningComments ? (
                <div className={styles.commentSection}>
                    <CommentFeed/>
                </div>
            ) : <div/>}
        </div>
    );
}
