import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CreateComment.module.css";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import React from "react";

interface CreateCommentProps {
    onSubmit: () => void;
    commentText: string;
    onTextChange: (text: string) => void;
}

const CreateComment = ({onSubmit, commentText, onTextChange}: CreateCommentProps) => {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    }
    return(
        <div className={styles.createComment}>
            <input
                placeholder="Comment"
                value={commentText}
                onChange={(e) => onTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
            >

            </input>
            <button onClick={onSubmit}>
                <FontAwesomeIcon icon={faPaperPlane}/>
            </button>
        </div>
    )
};

export default CreateComment;