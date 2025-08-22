"use client";

import {useState} from 'react';
import { CommentData } from '@/lib/firebase/interfaces';
import styles from './CommentCard.module.css';
import profile from '@/public/png-transparent-default-avatar.png'
import Image from 'next/image';
import { formatTimestamp } from '@/components/helper';

interface CommentCardProps {
    comment: CommentData & { hasRayed?: boolean };
    onRayToggle: (shineId: string, newRayCount: number, hasRayed: boolean) => void;
}


export default function CommentCard({comment, onRayToggle}: CommentCardProps) {
    return (
        <div className={styles.commentCard}>
            <div className={styles.shineHeader}>
                {comment.userPhotoUrl ? (
                    <img src={comment.userPhotoUrl} alt={comment.username} className={styles.userPhoto} />
                ) : (
                    <Image src={profile} alt="navbar logo" width="110" height="110" className={styles.userPhotoDefault}/>
                )}
                <div className={styles.userInfo}>
                    <span className={styles.username}>{comment.username}</span>
                    <span className={styles.timestamp}>{formatTimestamp(comment.createdAt)}</span>
                </div>
            </div>
        </div>
    )
}