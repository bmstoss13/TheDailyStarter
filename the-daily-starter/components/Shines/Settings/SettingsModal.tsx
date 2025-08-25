import { useState } from "react";
import styles from "./SettingsModal.module.css"
import { CurrentUserModalData, ShineData, UserProfileData } from "@/lib/firebase/interfaces";

interface SettingsModalProps {
    shine: ShineData
    currentUser: CurrentUserModalData
    onClose: () => void
    onDelete: () => void
}

const SettingsModal = ({shine, currentUser, onClose, onDelete}: SettingsModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = shine.uid === currentUser.uid

    const handleDelete = () => {
        if(!isDeleting){
            setIsDeleting(true)
        }
        onDelete()
    }
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.settingsContainer} onClick={(e) => e.stopPropagation()}>
                {/* Conditionally render the delete button only if the user is the owner */}
                {isOwner && (
                    <>
                        <button 
                            className={styles.deleteShine}
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <p className={styles.deleteText}>Delete</p>
                        </button>
                        <button className={styles.cancelButton} onClick={onClose}>
                            <p>Cancel</p>
                        </button>
                    </>
                )}
                {/* Add a close button for all users */}
                {!isOwner && (
                    <button className={styles.cancelButton} onClick={onClose}>
                        <p>Close</p>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SettingsModal;