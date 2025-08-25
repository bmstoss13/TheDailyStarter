import { useState } from "react";
import styles from "./ProfileSettings.module.css";
import { UserProfileData } from "@/lib/firebase/interfaces";

interface SettingsModalProps {
    currentUser: UserProfileData;
    onClose: () => void;
    onDelete: (userId: string) => void;
}

const ProfileSettingsModal = ({ currentUser, onClose, onDelete }: SettingsModalProps) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        onDelete(currentUser.uid!);
    };

    const optionsView = (
        <div className={styles.settingsContainer}>
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
                    <button className={styles.cancelButton} onClick={onClose}>
                        <p>Cancel</p>
                    </button>
                </>
        </div>
    );

    // The delete confirmation view
    const deleteConfirmationView = (
        <div className={styles.settingsContainer}>
            <p className={styles.modalTitle}>Are you sure you want to delete this Shine?</p>
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

export default ProfileSettingsModal;