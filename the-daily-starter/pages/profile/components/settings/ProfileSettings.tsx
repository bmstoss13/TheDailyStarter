import { useState } from "react";
import styles from "./ProfileSettings.module.css";
import { UserProfileData } from "@/lib/firebase/interfaces";
import { signOutUser } from "@/lib/firebase/clientUtils/authService";
import { useRouter } from "next/router";

interface SettingsModalProps {
    currentUser: UserProfileData;
    onEdit: (userId: string) => void;
    onClose: () => void;
    onDelete: (userId: string) => void;

}

const ProfileSettingsModal = ({ currentUser, onClose, onDelete, onEdit }: SettingsModalProps) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const router = useRouter();

    const handleEditClick = () => {
        onEdit(currentUser.uid!)
    }

    const handleLogout = async () => {
        try{
            await signOutUser();
            router.push('/');
        } catch (err: any) {
            console.error("An error occurred while signing user out: ", err);
        }
    }

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
                        className={styles.cancelButton}
                        onClick={handleEditClick}
                    >
                        <p>Edit</p>
                    </button>
                    <button 
                        className={styles.cancelButton}
                        onClick={handleLogout}
                    >
                        <p>Logout</p>
                    </button>
                    <button 
                        className={styles.deleteShine}
                        onClick={handleDeleteClick}
                    >
                        <p className={styles.deleteText}>Delete Account</p>
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
            <p className={styles.modalTitle}>Are you sure you want to delete your account?</p>
            <button 
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
            >
                <p className={styles.confirmDeleteText}>Delete Account</p>
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
            <div onClick={(e) => e.stopPropagation()}>
                {showDeleteConfirmation ? deleteConfirmationView : optionsView}
            </div>
        </div>
    );
};

export default ProfileSettingsModal;