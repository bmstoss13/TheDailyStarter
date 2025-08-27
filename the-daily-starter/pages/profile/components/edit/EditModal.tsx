import { UserProfileData } from '@/lib/firebase/interfaces'
import axios, { Axios } from 'axios'
import styles from './EditModal.module.css'
import { useRef, useState } from 'react';

interface EditModalProps {
    currentUser: UserProfileData;
    onClose: () => void;
}

const EditModal = ({currentUser, onClose} : EditModalProps) => {
    const [uploadedPhoto, setUploadedPhoto] = useState(currentUser.photoURL)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleContainerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    const handleChangePhoto = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    return(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.editContainer} onClick={handleContainerClick}>
                <div className={styles.imageRow}>
                    <div className={styles.profilePictureWrapper}>
                        <img 
                            src={uploadedPhoto || ''} 
                            alt="profile picture" 
                            className={styles.profilePicture}
                        />
                        <div className={styles.changeButton}>  
                            <button onClick={handleChangePhoto}>Change</button> 
                        </div>
                    </div>

                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <div className={styles.usernameRow}>
                        <p>Username:</p>
                        <input placeholder={currentUser.username}></input>
                    </div>
                </div>                  

            </div>
        </div>
    )
}

export default EditModal