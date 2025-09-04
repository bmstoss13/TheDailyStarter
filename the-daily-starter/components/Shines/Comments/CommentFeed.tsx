import { CommentDataWithRayStatus } from "@/lib/firebase/interfaces"
import styles from "./CommentFeed.module.css"
import CommentCard from "./CommentCard";

interface CommentFeedProps{
    comments: CommentDataWithRayStatus[];
    onClickSettings: (comment: CommentDataWithRayStatus) => void;
    handleToggleRay: (commentId: string) => void;
    replies: Record<string, CommentDataWithRayStatus[]>
    replyHasMore: Record<string, boolean>;
    replyLoading: Record<string, boolean>
    onFetchReplies: (commentId: string, startAfterId?: string) => void;
    handleStartReplying: (comment: CommentDataWithRayStatus) => void;
}

const CommentFeed = ({
    comments, 
    onClickSettings, 
    handleToggleRay,
    replies,
    replyHasMore,
    replyLoading,
    onFetchReplies,
    handleStartReplying,
}: CommentFeedProps) => {

    if (!comments || comments.length === 0) {
        return (
            <div className={styles.noCommentsMessage}>
                No comments yet. Be the 
                <p className ={styles.zestyMessage}>first!</p>
            </div>
        )
    }
    return (
        <div className={styles.commentListContainer}>
            {comments.map((comment) => (
                <CommentCard
                    key={comment.id}
                    comment={comment}
                    onClickSettings={onClickSettings}
                    onRayToggle={handleToggleRay}
                    replies={replies[comment.id || ''] || []}
                    hasMoreReplies={replyHasMore[comment.id || '']}
                    isLoadingReplies={replyLoading[comment.id || '']}
                    onFetchReplies={onFetchReplies}
                    handleStartReplying={handleStartReplying}
                />
            ))}
        </div>
    )
}

export default CommentFeed