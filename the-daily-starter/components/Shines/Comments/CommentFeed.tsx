import { CommentDataWithRayStatus } from "@/lib/firebase/interfaces"
import styles from "./CommentFeed.module.css"
import CommentCard from "./CommentCard";

interface CommentFeedProps{
    comments: CommentDataWithRayStatus[];
}

const CommentFeed = ({comments}: CommentFeedProps) => {
    const handleRayToggle = () => {

    }

    if (!comments || comments.length === 0) {
        return (
            <div className={styles.noCommentsMessage}>
                No comments yet. Be the first!
            </div>
        )
    }
    return (
        <div className={styles.commentListContainer}>
            {comments.map((comment) => (
                <CommentCard
                    key={comment.id}
                    comment={comment}
                    onRayToggle={handleRayToggle}
                />
            ))}
        </div>
    )
}

export default CommentFeed