"use client";

import {useState} from 'react';
import { CommentData, CommentDataWithRayStatus } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faReply } from '@fortawesome/free-solid-svg-icons';
import { faSun as faSunRegular } from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import styles from './CommentCard.module.css';
import profile from '@/public/png-transparent-default-avatar.png'
import Image from 'next/image';
import { formatTimestamp } from '@/components/helper';

interface CommentCardProps {
    comment: CommentDataWithRayStatus;
    onRayToggle: (commentId: string) => void;
    onClickSettings: (comment: CommentDataWithRayStatus) => void;

}


export default function CommentCard({comment, onClickSettings, onRayToggle}: CommentCardProps) {

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
                        <p className={styles.username}>{comment.username}</p>
                    </div>

                    <div className={styles.commentText}>
                        <p>{comment.text}</p>
                    </div>

                    <button
                        onClick={() => onClickSettings(comment)}
                    >
                        <FontAwesomeIcon
                            icon={faEllipsis}
                        />
                    </button>
                </div>
                <div className={styles.commentCardStats}>
                    <span className={styles.timestamp}>{formatTimestamp(createdAtDate)}</span>
                    <p>{comment.replyCount} replies</p>
                    <p>{comment.rayCount} rays</p>

                </div>


            </div>
            {comment.id && (
                <div className={styles.commentCardButtons}>
                    <button
                        className={`${styles.commentButton}`}
                    >
                        <FontAwesomeIcon
                            icon={faReply}
                            className={styles.commentIcon}
                        />
                    </button>
                    <button
                        className={`${styles.rayButton} ${comment.hasRayed ? styles.rayed : ''}`}
                        onClick={() => {comment.id && onRayToggle(comment.id)}}
                    >
                        <FontAwesomeIcon
                            icon={comment.hasRayed ? faSun : faSunRegular}
                            className={styles.rayIcon}
                        />
                    </button>
                </div>
            )}

        </div>
    )
}