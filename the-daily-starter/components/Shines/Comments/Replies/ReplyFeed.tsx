import { CommentDataWithRayStatus } from "@/lib/firebase/interfaces";
import styles from "./ReplyFeed.module.css";
import ReplyCard from "./ReplyCard";

interface ReplyFeedProps {
    parentComment: CommentDataWithRayStatus
    replies: CommentDataWithRayStatus[];
    onClickSettings: (
        reply: CommentDataWithRayStatus,
        parentComment: CommentDataWithRayStatus
    ) => void;
    onRayToggle: (replyId: string) => void;
    handleStartReplying: (
        parent: CommentDataWithRayStatus,
        target: CommentDataWithRayStatus
    ) => void;
}

const ReplyFeed = ({ parentComment, replies, onClickSettings, onRayToggle, handleStartReplying }: ReplyFeedProps) => {
    if (!replies || replies.length === 0) {
        return null;
    }

    return (
        <div className={styles.replyListContainer}>
            {replies.map((reply) => (
                <ReplyCard
                    parentComment={parentComment}
                    key={reply.id}
                    reply={reply}
                    onClickSettings={(reply) => onClickSettings(reply, parentComment)}
                    onRayToggle={onRayToggle}
                    handleStartReplying={handleStartReplying}
                />
            ))}
        </div>
    );
};

export default ReplyFeed;
