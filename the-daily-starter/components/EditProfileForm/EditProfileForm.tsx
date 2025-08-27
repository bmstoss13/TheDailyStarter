// components/EditProfileForm/EditProfileForm.tsx

import { useState, useRef, useEffect } from 'react';
import { UserProfileData } from '@/lib/firebase/interfaces'; // You may need to import this type
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './EditProfileForm.module.css'; // Create a new CSS module for the form

const placeholderPronouns = 'he/him';
const placeholderBio = 'I love software engineering!'

interface EditProfileFormProps {
    userProfile: UserProfileData;
    onSave: () => void;
    onBack: () => void;
    onEditName: () => void;
}

const EditProfileForm = ({ userProfile, onSave, onBack, onEditName }: EditProfileFormProps) => {
    const [uploadedPhoto, setUploadedPhoto] = useState('');
    const [username, setUsername] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userProfile) {
            setUploadedPhoto(userProfile.photoURL || '');
            setUsername(userProfile.username);
            setFirstName(userProfile.firstName);
            setLastName(userProfile.lastName);
            setPronouns(placeholderPronouns);
            setBio(placeholderBio);
        }
    }, [userProfile]);

    const handleChangePhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.editFormContainer}>
            <div className={styles.editHeaderWrapper}>
                <button className={styles.backToProfile} onClick={onBack}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                    <p>Back</p>
                </button>
                <div className={styles.editProfileHeaderContainer}>
                    <h2>Edit Profile</h2>
                </div>
                <div className={styles.backToProfile}></div>
            </div>
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
                <div className={styles.infoContainer}>
                    <div className={styles.nameRow}>
                        <p>{firstName} {lastName}</p>
                        <p className={styles.pronouns}>({pronouns})</p>
                        <button onClick={onEditName}>
                            <FontAwesomeIcon icon={faEdit}/>
                        </button>

                    </div>

                </div>
            </div>
            <div className={styles.usernameRow}>
                <p className={styles.username}>Username</p>
                <input defaultValue={username} placeholder={'Whatcha wanna go by?'}></input>
            </div>
            <div className={styles.bio}>
                <h2>Bio</h2>
                <input defaultValue={bio} placeholder={'Tell the world how amazing you are!'}/>
            </div>

            <div className={styles.saveEdits}>
                <button onClick={onSave}>Save</button>
            </div>
        </div>
    );
};

export default EditProfileForm;