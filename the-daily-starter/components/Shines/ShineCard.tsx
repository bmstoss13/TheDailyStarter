"use client";

import React, { useState } from 'react';
import { auth } from "@/lib/firebase/firebase";
import { CommentDataWithRayStatus, ShineData, ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faComment } from '@fortawesome/free-solid-svg-icons';
import { faSun as faSunRegular } from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { formatTimestamp } from '../helper';
import profile from '@/public/png-transparent-default-avatar.png';
import Image from "next/image";

import styles from './ShineCard.module.css';

import CommentCard from './Comments/CommentCard';
import CommentFeed from './Comments/CommentFeed';
import { getJsonApi } from '@/lib/routes/routes';

interface ShineCardProps {
    shine: ShineDataWithRayStatus; // Updated type to match the data being passed
    onRayToggle: (shineId: string) => void;
    onSettingsClick: (shine: ShineDataWithRayStatus) => void; // Updated type
    onCommentsClick: (shine: ShineDataWithRayStatus) => void;
    userProfile: UserProfileData;
}

const api = getJsonApi();

export default function ShineCard({ shine, onRayToggle, onSettingsClick, onCommentsClick, userProfile }: ShineCardProps) {

    const handleRayToggle = async () => {
        onRayToggle(shine.id!)
    };

    const createdAtDate = new Date(shine.createdAt);
    return (
        <div className={styles.shineCard}>
            <div className={styles.shineHeader}>
                {shine.userPhotoUrl ? (
                    <img src={shine.userPhotoUrl} alt={shine.username} className={styles.userPhoto} />
                ) : (
                    <Image src={profile} alt="user avatar" width={110} height={110} className={styles.userPhotoDefault} />
                )}
                <div className={styles.userInfo}>
                    <span className={styles.username}>{shine.username}</span>
                    <span className={styles.timestamp}>{formatTimestamp(createdAtDate)}</span>
                </div>
                <button 
                    className={styles.settingsButton}
                    onClick={() => onSettingsClick(shine)}
                >
                    <FontAwesomeIcon 
                        icon={faEllipsis}
                        className={styles.settingsIcon}
                    />
                </button>

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
                    onClick={() => onCommentsClick(shine)}
                >
                    <FontAwesomeIcon
                        icon={faComment}
                        className={styles.commentIcon}
                    />
                </button>
                <button
                    className={`${styles.rayButton} ${shine.hasRayed ? styles.rayed : ''}`}
                    onClick={handleRayToggle}
                >
                    <FontAwesomeIcon
                        icon={shine.hasRayed ? faSun : faSunRegular}
                        className={styles.rayIcon}
                    />
                </button>
                <span>{shine.rayCount}</span>
            </div>
        </div>
    );
}
