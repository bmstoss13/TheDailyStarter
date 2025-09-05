"use client";

import {useState, useEffect} from 'react';
import { CommentData, CommentDataWithRayStatus } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faReply } from '@fortawesome/free-solid-svg-icons';
import { faSun as faSunRegular } from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import styles from './CommentCard.module.css';
import profile from '@/public/png-transparent-default-avatar.png'
import Image from 'next/image';
import { formatTimestamp } from '@/components/helper';
import CommentFeed from './CommentFeed';
import ReplyFeed from './Replies/ReplyFeed';

interface CommentCardProps {
    comment: CommentDataWithRayStatus;
    onRayToggle: (commentId: string) => void;
    onClickSettings: (
        comment: CommentDataWithRayStatus,
        parentComment?: CommentDataWithRayStatus | null
    ) => void;
    replies: CommentDataWithRayStatus[];
    hasMoreReplies?: boolean;
    isLoadingReplies?: boolean;
    onFetchReplies: (commentId: string, startAfterId?: string) => void;  
    handleStartReplying: (
        parent: CommentDataWithRayStatus,
        target: CommentDataWithRayStatus
    ) => void; 
}


export default function CommentCard({
    comment, 
    onClickSettings, 
    onRayToggle,
    replies,
    hasMoreReplies,
    isLoadingReplies,
    onFetchReplies,
    handleStartReplying,
}: CommentCardProps) {
    const [showReplies, setShowReplies] = useState(false);

    const createdAtDate = new Date(comment.createdAt)
    
    const handleToggleReplies = () => {
        if(!showReplies && replies.length === 0) {
            if(comment.id){
                onFetchReplies(comment.id);
            }
        }
        setShowReplies(!showReplies);
    }
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
                        onClick={() => onClickSettings(comment, null)}
                    >
                        <FontAwesomeIcon
                            icon={faEllipsis}
                        />
                    </button>
                </div>



            </div>
            <div className={styles.commentCardFooter}>
                    <div className={styles.commentCardStats}>
                        <span className={styles.timestamp}>{formatTimestamp(createdAtDate)}</span>
                        <button onClick={handleToggleReplies}>
                            <p>{showReplies ? "Hide Replies" : comment.replyCount > 0 ? `View ${comment.replyCount} replies` : `${comment.replyCount} replies`}</p>
                        </button>
                        <p>{comment.rayCount} rays</p>

                    </div>

            {comment.id && (
                <div className={styles.commentCardButtons}>

                    <button
                        className={`${styles.commentButton}`}
                        onClick={() => handleStartReplying(comment, comment)}
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

            {showReplies && (
                <div className={styles.replySection}>
                    {replies.length > 0 && (
                        <ReplyFeed
                            key={`${comment.id}-${replies.length}`}
                            parentComment={comment}
                            onClickSettings={onClickSettings}
                            onRayToggle={onRayToggle}
                            replies={replies}
                            handleStartReplying={handleStartReplying}
                        />                           
                    )}
                {hasMoreReplies && !isLoadingReplies && (
                    <button
                        className={styles.loadMoreReplies}
                        onClick={() => onFetchReplies(comment.id || '', replies[replies.length - 1]?.id)}
                    >
                        Load more replies
                    </button>
                )}

                {isLoadingReplies && <p>Loading...</p>}
                </div>
            )}

        </div>
    )
}