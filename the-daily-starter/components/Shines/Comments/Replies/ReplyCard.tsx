"use client";

import { CommentDataWithRayStatus } from "@/lib/firebase/interfaces";
import styles from "./ReplyCard.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faSun, faReply } from "@fortawesome/free-solid-svg-icons";
import { faSun as faSunRegular } from "@fortawesome/free-regular-svg-icons";
import { formatTimestamp } from "@/components/helper";
import profile from "@/public/png-transparent-default-avatar.png"


interface ReplyCardProps{
    parentComment: CommentDataWithRayStatus
    reply: CommentDataWithRayStatus;
    onRayToggle: (replyId: string) => void;
    onClickSettings: (
        reply: CommentDataWithRayStatus,
        parentComment: CommentDataWithRayStatus
    ) => void;
    handleStartReplying: (
        parentComment: CommentDataWithRayStatus,
        reply: CommentDataWithRayStatus
    ) => void;
}
const ReplyCard = ({
    parentComment,
    reply,
    onRayToggle,
    onClickSettings,
    handleStartReplying,
}: ReplyCardProps) => {

    const createdAtDate = new Date(reply.createdAt);
    return (
        <div className={styles.replyCard}>
            <div className={styles.replyBody}>
                <div className={styles.replyHeader}>
                    {reply.userPhotoUrl ? (
                        <img src={reply.userPhotoUrl} alt={reply.username} className={styles.userPhoto} />
                    ) : (
                        <Image src={profile} alt="default avatar" width="40" height="40" className={styles.userPhotoDefault} />
                    )}
                    <div className={styles.userInfo}>
                        <p className={styles.username}>{reply.username}</p>
                    </div>
                    <div className={styles.replyText}>
                        <p>{reply.text}</p>
                    </div>

                    <button onClick={() => onClickSettings(reply, parentComment)}>
                        <FontAwesomeIcon icon={faEllipsis} />
                    </button>
                </div>



                <div className={styles.replyStats}>
                    <span className={styles.timestamp}>{formatTimestamp(createdAtDate)}</span>
                    <p>{reply.rayCount} rays</p>
                </div>

                <div className={styles.replyButtons}>
                    <button
                        className={styles.replyButton}
                        onClick={() => handleStartReplying(parentComment, reply)}
                    >
                        <FontAwesomeIcon icon={faReply} />
                    </button>
                    <button
                        className={`${styles.rayButton} ${reply.hasRayed ? styles.rayed : ""}`}
                        onClick={() => reply.id && onRayToggle(reply.id)}
                    >
                        <FontAwesomeIcon
                        icon={reply.hasRayed ? faSun : faSunRegular}
                        className={styles.rayIcon}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReplyCard;