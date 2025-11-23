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
import CommentSettingsModal from './Settings/CommentSettings';
import { User } from 'firebase/auth';

interface CommentFeedModalProps {
    shine: ShineDataWithRayStatus;
    userProfile: UserProfileData;
    user: User | null;
    onClose: () => void;
}

const api = getJsonApi();

export default function CommentFeedModal({ shine, userProfile, user, onClose }: CommentFeedModalProps) {
    const [commentText, setCommentText] = useState<string>('');
    const [comments, setComments] = useState<CommentDataWithRayStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [replies, setReplies] = useState<Record<string, CommentDataWithRayStatus[]>>({});
    const [replyHasMore, setReplyHasMore] = useState<Record<string, boolean>>({});
    const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({});
    const [isClickingSettings, setIsClickingSettings] = useState(false);
    const [editingComment, setEditingComment] = useState<CommentDataWithRayStatus | null>(null);
    const [replyingTo, setReplyingTo] = useState<CommentDataWithRayStatus | null>(null);
    const [parentComment, setParentComment] = useState<CommentDataWithRayStatus | null>(null);
    const [settingsTarget, setSettingsTarget] = useState<{
        comment: CommentDataWithRayStatus | null,
        parent: CommentDataWithRayStatus | null
    }>({ comment: null, parent: null});

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

            if (editingComment) {
                const url = `/v1/shines/${shine.id}/comments/${editingComment.id}`;
                await api.put<CommentDataWithRayStatus>(url, requestBody, {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });

                if (parentComment) {
                    setReplies(prevReplies => {
                        const parentId = parentComment.id || '';
                        const updatedReplies = { ...prevReplies };
                        if (updatedReplies[parentId]) {
                            updatedReplies[parentId] = updatedReplies[parentId].map(r =>
                                r.id === editingComment.id ? { ...r, text: commentText } : r
                            );
                        }
                        return updatedReplies;
                    });
                } else {
                    setComments(prevComments =>
                        prevComments.map(c =>
                            c.id === editingComment.id ? { ...c, text: commentText } : c
                        )
                    );
                }

                setEditingComment(null);
                setParentComment(null); 
                setCommentText('');            
            } else if (replyingTo && parentComment) {
                const url = `/v1/shines/${shine.id}/comments/${parentComment.id}`;
                const { data } = await api.post<CommentDataWithRayStatus>(url, requestBody,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}` 
                        },
                    }
                );

                const newReply = {
                    ...data,
                    username: userProfile.username,
                    userPhotoUrl: userProfile.photoURL
                };

                const parentId = parentComment.id;

                // const id = replyingTo.id
                setReplies(prev => ({
                    ...prev,
                    [parentId || '']: [newReply, ...(prev[parentId || ''] || [])]
                }));

                setComments(prev =>
                    prev.map(c =>
                        c.id === parentId
                            ? { ...c, replyCount: c.replyCount + 1}
                            : c
                    )
                );

                setReplyingTo(null);
                setParentComment(null);
                setCommentText('');
            } else {
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
            }
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

    const handleStartEditing = (
        comment: CommentDataWithRayStatus,
        parent?: CommentDataWithRayStatus | null
    ) => {
        setEditingComment(comment);
        setCommentText(comment.text);
        setParentComment(parent ?? null);
        handleClosingSettings();
    }

    const handleClickSettings = (
        comment: CommentDataWithRayStatus,
        parent?: CommentDataWithRayStatus | null
    ) => {
        setSettingsTarget({ comment, parent: parent ?? null})
        if(parentComment) console.log("parent set: " + parentComment.id)
        setIsClickingSettings(true)
    }

    const handleClosingSettings = () => {
        setSettingsTarget({ comment: null, parent: null });
        setIsClickingSettings(false)
    }

    const handleStartReplying = (
        parent: CommentDataWithRayStatus,
        target: CommentDataWithRayStatus
    ) => {
        setParentComment(parent)
        setReplyingTo(target)
    }

    const handleDeleteComment = async(
        commentId: string, 
        parentComment?: CommentDataWithRayStatus | null
    ) => {
        if (!commentId) return;
        try{
            const currentUser = auth.currentUser;
            if(!currentUser) {
                console.error("Must be authorized to delete this comment.")
                return;
            }

            const idToken = await currentUser.getIdToken();

            if(!idToken) {
                console.error("Failed to extract id token from authorized user.")
                return;
            }

            await api.delete(
                `v1/shines/${shine.id}/comments/${commentId}`,
                {
                    headers: { 
                        'Authorization': `Bearer ${idToken}` 
                    },
                }
            );
            if (!parentComment) {
                setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
            } else {
                setComments(prevComments => 
                    prevComments.map(comment =>
                        comment.id === parentComment.id
                            ? {
                                ...comment,
                                replyCount: Math.max(comment.replyCount - 1, 0),
                            }
                            : comment
                    )
                );
                setReplies(prevReplies => {
                    const updatedReplies = { ...prevReplies };
                    if (updatedReplies[parentComment.id || '']) {
                        updatedReplies[parentComment.id || ''] = updatedReplies[parentComment.id || ''].filter(reply => reply.id !== commentId);
                    }
                    return updatedReplies;
                });
            }


            handleClosingSettings();

        } catch (err: any) {
            console.error("An error occurred while deleting comment: ", err);
        };
    }

    const handleToggleCommentRay = async(commentId: string) => {
        if(!user) return;

        try {
            const idToken = await user.getIdToken();
            if(!idToken){
                console.error("An error occurred while extracting id token from user while toggling ray on comment.");
                return;
            }

            const url = `/v1/shines/${shine.id}/comments/${commentId}/toggleRay`;
            const { data } = await api.post(url, null, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            const hasRayed = data;

            setComments(prev =>
                prev.map(c =>
                    c.id === commentId
                        ? { ...c, hasRayed, rayCount: hasRayed ? c.rayCount + 1 : c.rayCount - 1 }
                        : c
                )
            );

            setReplies(prev => {
                const updated = { ...prev };
                for (const parentId in updated) {
                    updated[parentId] = updated[parentId].map(r =>
                        r.id === commentId
                            ? { ...r, hasRayed, rayCount: hasRayed ? r.rayCount + 1 : r.rayCount - 1 }
                            : r
                    );
                }
                return updated;
            });

        } catch (err: any) {
            console.error("An error occurred while toggling ray on comment: ", err);
        }
    }


    const handleFetchReplies = async(commentId: string, startAfterId?: string) => {
        if (!commentId || replyLoading[commentId]) return;
        setReplyLoading(prev => ({ ...prev, [commentId]: true}));
        try{
            const currentUser = auth.currentUser;
            if(!currentUser) {
                console.error("Current user is not authorized to view replies.")
                return;
            }

            const idToken = await currentUser.getIdToken()
            if (!idToken) {
                console.error("Unable to retrieve ID token for user.");
                return;
            }

            const url = `v1/comments/${commentId}/replies`
            const { data } = await api.get<CommentDataWithRayStatus[]>(
                url, 
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

            setReplies(prev => ({
                ...prev,
                [commentId]: startAfterId
                    ? [...(prev[commentId] || []), ...data]
                    : data
            }))

            if(data.length < 10) {
                setReplyHasMore(prev => ({ ...prev, [commentId]: false}));
            } else {
                setReplyHasMore(prev => ({ ...prev, [commentId]: true}));
            }
        } catch (err: any) {
            console.error("An error occurred while fetching replies for comment, " + commentId);
        } finally{ 
            setReplyLoading(prev => ({...prev, [commentId]: false}));
        }
    }

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
                    {replyingTo && (
                        <div>
                            Replying to @{replyingTo.username}
                            <button onClick={() => {
                                setReplyingTo(null)
                                setParentComment(null)
                            }}>
                                Cancel
                            </button>
                        </div>
                    )}
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
                        onClickSettings={handleClickSettings}
                        handleToggleRay={handleToggleCommentRay}
                        replies={replies}
                        replyHasMore={replyHasMore}
                        replyLoading={replyLoading}
                        onFetchReplies={handleFetchReplies}   
                        handleStartReplying={handleStartReplying}                     
                    />
                </div>
            </div>
            {isClickingSettings && settingsTarget.comment && (
                <CommentSettingsModal 
                    comment={settingsTarget.comment}
                    parentComment={settingsTarget.parent}
                    currentUser={userProfile}
                    onClose={handleClosingSettings}
                    onDelete={handleDeleteComment}
                    onEdit={handleStartEditing}
                />
            )}
        </Modal>
    )
}