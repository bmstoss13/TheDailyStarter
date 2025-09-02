"use client";

import {useState} from 'react';
import { CommentData, CommentDataWithRayStatus } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faReply } from '@fortawesome/free-solid-svg-icons';
import { faSun as faSunRegular } from '@fortawesome/free-regular-svg-icons';
import styles from './CommentCard.module.css';
import profile from '@/public/png-transparent-default-avatar.png'
import Image from 'next/image';
import { formatTimestamp } from '@/components/helper';

interface CommentCardProps {
    comment: CommentDataWithRayStatus;
    onRayToggle: (shineId: string, newRayCount: number, hasRayed: boolean) => void;
}


export default function CommentCard({comment, onRayToggle}: CommentCardProps) {

    const createdAtDate = new Date(comment.createdAt)
    return (
        <div className={styles.commentCard}>
            <div className={styles.commentCardBody}>
                <div className={styles.commentHeader}>
                    {comment.userPhotoUrl ? (
                        <img src={comment.userPhotoUrl} alt={comment.username} className={styles.userPhoto} />
                    ) : (
                        <Image src={profile} alt="navbar logo" width="110" height="110" className={styles.userPhotoDefault}/>
                    )}
                    <div className={styles.userInfo}>
                        <span className={styles.username}>{comment.username}</span>
                        <span className={styles.timestamp}>{formatTimestamp(createdAtDate)}</span>
                    </div>

                </div>


                <div className={styles.commentText}>
                    {comment.text}
                </div>

                <div className={styles.commentCardStats}>
                    <p>{comment.replyCount} replies</p>
                    <p>{comment.rayCount} rays</p>
                </div>


            </div>
            <div className={styles.commentCardButtons}>
                <button
                    className={`${styles.commentButton}`}
                >
                    <FontAwesomeIcon
                        icon={faReply}
                    />
                </button>
                <button
                    className={`${styles.rayButton} ${comment.hasRayed ? styles.rayed : ''}`}
                    // onClick={onRayToggle}
                >
                    <FontAwesomeIcon
                        icon={comment.hasRayed ? faSun : faSunRegular}
                        className={styles.rayIcon}
                    />

                </button>


            </div>


        </div>
    )
}