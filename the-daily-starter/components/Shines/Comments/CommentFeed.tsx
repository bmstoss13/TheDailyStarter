import { CommentDataWithRayStatus } from "@/lib/firebase/interfaces"
import styles from "./CommentFeed.module.css"
import CommentCard from "./CommentCard";

interface CommentFeedProps{
    comments: CommentDataWithRayStatus[];
    onClickSettings: (comment: CommentDataWithRayStatus) => void;
    handleToggleRay: (commentId: string) => void;
}

const CommentFeed = ({comments, onClickSettings, handleToggleRay}: CommentFeedProps) => {

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
                />
            ))}
        </div>
    )
}

export default CommentFeed