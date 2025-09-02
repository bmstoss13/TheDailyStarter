"use client";

import { useState, useCallback, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faX } from '@fortawesome/free-solid-svg-icons';

import CommentCard from './CommentCard';

import styles from './CommentFeedModal.module.css';
import { CommentDataWithRayStatus, ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import { getJsonApi } from '@/lib/routes/routes';
import Modal from '@/components/Modal';
import CreateComment from './CreateComment';
import CommentFeed from './CommentFeed';
import ShinePost from './ShinePost';

interface CommentFeedModalProps {
    shine: ShineDataWithRayStatus;
    userProfile: UserProfileData;
    onClose: () => void;
}

const api = getJsonApi();

export default function CommentFeedModal({ shine, userProfile, onClose }: CommentFeedModalProps) {
    const [commentText, setCommentText] = useState<string>('');
    const [comments, setComments] = useState<CommentDataWithRayStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleSubmit = async () => {
        if(!commentText.trim()) return;
        try{
            const currentUser = auth.currentUser;
            if(!currentUser) {
                console.error("Current user is not authorized.")
                return;
            }

            const idToken = await currentUser.getIdToken();
            if (!idToken) {
                console.error("No id token retrieved for user.");
                return;
            }

            const requestBody = {
                text: commentText,
            };

            const { data } = await api.post<CommentDataWithRayStatus>(
                `v1/shines/${shine.id}/comments`,
                requestBody,
                {

                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                }
            );

            const newComment = {
                ...data,
                username: userProfile.username,
                userPhotoUrl: userProfile.photoURL,
            }

            setComments(prevComments => [newComment, ...prevComments]);
            setCommentText('')
        } catch (err: any) {
            console.error("An error occurred while creating comment: ", err);
        }
    }

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

            if (!startAfterId) {
                setComments(data);
            } else {
                setComments(prevComments => [...prevComments, ...data]);
            }            
        } catch (err: any) {
            console.error("An error occurred while loading comments: ", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        setComments([]);
        setHasMore(true);
        fetchComments();
    }, [shine.id]); // Fetch comments when the modal opens

    const handleLoadMore = () => {
        if (comments.length > 0) {
            const lastCommentId = comments[comments.length - 1].id;
            fetchComments(lastCommentId);
        }
    };

    return (
        <Modal 
            onClose={onClose} 
            title={"Comments"} 
            iconProps={{
                icon: faComment,
                color: "var(--iconColor)",
            }}
            footer={
                <div className={styles.createCommentContainer}>
                    <CreateComment 
                        onSubmit={handleSubmit}
                        commentText={commentText}
                        onTextChange={setCommentText}
                    />
                </div>
            }
        > 
            <div className={styles.commentModal}>
                <div className={styles.shinePostContainer}>
                    <ShinePost
                        shine={shine}
                    />
                </div>
                <div className={styles.commentContent}>
                    <CommentFeed 
                        comments={comments}
                        
                    />
                </div>

            </div>
        </Modal>
    )
}