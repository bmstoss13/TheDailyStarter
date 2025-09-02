"use client";

import { useState, useCallback, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';

import CommentCard from './CommentCard';

import styles from './CommentFeed.module.css';
import { CommentDataWithRayStatus, ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import { getJsonApi } from '@/lib/routes/routes';

interface CommentFeedModalProps {
    shine: ShineDataWithRayStatus;
    userProfile: UserProfileData;
    onClose: () => void;
}

const api = getJsonApi();

export default function CommentFeedModal({ shine, userProfile, onClose }: CommentFeedModalProps) {
    const [comments, setComments] = useState<CommentDataWithRayStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchComments = async (startAfterId?: string) => {
        if (!shine.id || isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("Current user is not authorized.");
                return;
            };

            const idToken = await currentUser.getIdToken();
            if (!idToken) {
                console.error("No id token retrieved for user.");
                return;
            }

            const { data } = await api.get<CommentDataWithRayStatus[]>(
                `v1/shines/${shine.id}/comments`,
                {
                    params: {
                        limit: 10,
                        startAfter: startAfterId,
                    },
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                },
            );

            if (data.length < 10) {
                setHasMore(false);
            }

            setComments(prevComments => [...prevComments, ...data]);
        } catch (err: any) {
            console.error("An error occurred while loading comments: ", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchComments();
    }, [shine.id]); // Fetch comments when the modal opens

    const handleLoadMore = () => {
        if (comments.length > 0) {
            const lastCommentId = comments[comments.length - 1].id;
            fetchComments(lastCommentId);
        }
    };

    return (
        <div className={styles.commentModal}>
            <div className={styles.commentList}>
                <h1>Comment Placeholder</h1>
                {/* {comments.map((comment) => (
                <CommentCard
                    key={comment.id}
                    comment={comment}
                    onRayToggle={handleCommentCardRayToggle}
                />
                ))} */}
            </div>

        </div>
    )
}