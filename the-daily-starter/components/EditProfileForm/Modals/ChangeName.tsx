import { UserProfileData } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import styles from './ChangeName.module.css';

interface ChangeNameModalProps{
    userProfile: UserProfileData;
    onClose: () => void;
}

const ChangeNameModal = ({ userProfile, onClose }: ChangeNameModalProps) => {

    const handleContainerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    return(
        <div className={styles.editNameModalOverlay} onClick={onClose}>
            <div className={styles.nameModalContainer} onClick={handleContainerClick}>
                <button className={styles.closeModalButton} onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styles.orangeModalSection}>
                    <div className={styles.profilePictureEditor}>
                        <img src={userProfile.photoURL || '/png-transparent-default-avatar.png'}/>                    </div>
                    <div className={styles.photoEditingButtons}>
                        <div>
                            <button className={styles.photoEditingUpload}>
                                Upload
                            </button>
                        </div>
                        <div>
                            <button className={styles.photoEditingRemove}>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.modalBottomContainer}>
                    <div className={styles.modalFirstNameEdit}>
                        <p>First Name:</p>
                        <input defaultValue={userProfile.firstName}/>
                    </div>
                    <div className={styles.modalLastNameEdit}>
                        <p>Last Name:</p>
                        <input defaultValue={userProfile.lastName}/>
                    </div>
                    <div className={styles.modalPronouns}>
                        <p>Preferred Pronouns</p>
                    </div>
                </div>
                <div className={styles.cancelProfileEditModal} onClick={onClose}>
                    Save
                </div>
            </div>
        </div>
    )
}

export default ChangeNameModal;