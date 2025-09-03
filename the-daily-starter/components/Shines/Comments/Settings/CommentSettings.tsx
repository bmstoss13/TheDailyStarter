import { useState } from 'react';
import { CommentDataWithRayStatus, CurrentUserModalData, UserProfileData } from "@/lib/firebase/interfaces";
import styles from "./CommentSettings.module.css";

interface CommentSettingsModal{
    comment: CommentDataWithRayStatus;
    currentUser: UserProfileData;
    onClose: () => void;
    onDelete: (commentId: string) => void;
};

const CommentSettingsModal = ({comment, currentUser, onClose, onDelete}: CommentSettingsModal) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const isOwner = currentUser?.uid === comment.uid;

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        onDelete(comment.id!);
    };

    const optionsView = (
        <div className={styles.settingsContainer}>
            {isOwner ? (
                <>
                    <button 
                        className={styles.deleteShine}
                        onClick={handleDeleteClick}
                    >
                        <p className={styles.deleteText}>Delete</p>
                    </button>
                    <button className={styles.cancelButton}>
                        <p>Edit</p>
                    </button>
                    {/* <button className={styles.cancelButton}>
                        <p>Archive</p>
                    </button> */}
                    <button className={styles.cancelButton} onClick={onClose}>
                        <p>Cancel</p>
                    </button>
                </>
            ) : (
                <>
                    <button className={styles.cancelButton} onClick={onClose}>
                        <p>Close</p>
                    </button>
                </>
            )}
        </div>
    );

    // The delete confirmation view
    const deleteConfirmationView = (
        <div className={styles.settingsContainer}>
            <p className={styles.modalTitle}>Are you sure you want to delete this comment?</p>
            <button 
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
            >
                <p className={styles.confirmDeleteText}>Delete</p>
            </button>
            <button 
                className={styles.cancelButton} 
                onClick={() => setShowDeleteConfirmation(false)} // Go back to the options view
            >
                <p>Cancel</p>
            </button>
        </div>
    );

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* Prevent clicks on the content from closing the modal */}
            <div onClick={(e) => e.stopPropagation()}>
                {/* Conditionally render the correct view based on state */}
                {showDeleteConfirmation ? deleteConfirmationView : optionsView}
            </div>
        </div>
    );
};
export default CommentSettingsModal;