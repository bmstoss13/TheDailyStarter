"use client";

import { useState, useCallback } from 'react';

import CommentCard from './CommentCard';

import styles from './CommentFeed.module.css';
import { CommentData } from '@/lib/firebase/interfaces';

export default function CommentFeed() {
    const [comments, setComments] = useState<CommentData|[]>([]);


    // const handleCommentCardRayToggle = useCallback(
    //     (shineId: string, newRayCount: number, hasRayed: boolean) => {
    //         setComments((prevShines) =>
    //             prevShines.map((comment) =>
    //             comment.id === shineId
    //                 ? { ...comment, rayCount: newRayCount, hasRayed }
    //                 : comment
    //             )
    //         );
    //     },
    //     []
    // );

    return (
        <div>
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