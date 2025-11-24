"use client";

import React, { useState } from "react";
import styles from "./CreateShineForm.module.css";
import { UserProfileData } from "@/lib/firebase/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faStar, faX } from "@fortawesome/free-solid-svg-icons";

// Components & Hooks
import PhotoUpload from "./PhotoUpload";
import { useCreateShine } from "@/hooks/ShineFeed/useShines";

interface CreateShineFormProps {
    onClose: () => void;
    userProfile: UserProfileData;
    // Removed 'onShinePosted' -> The hook handles the update now
}

export default function CreateShineForm({ onClose, userProfile }: CreateShineFormProps) {
    // 1. Form State (Kept local)
    const [shineText, setShineText] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // 2. The Mutation Hook
    const { mutate, isPending } = useCreateShine(userProfile);

    // 3. Handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!shineText.trim()) return;

        // Fire mutation
        mutate(
            { text: shineText, file: mediaFile },
            {
                onSuccess: () => {
                    // Clear form and close modal only on success
                    setShineText('');
                    setMediaFile(null);
                    setMediaPreview('');
                    onClose();
                }
            }
        );
    };

    const handlePhotoSubmit = (file: File) => {
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setIsUploadingPhoto(false);
    };

    // --- Render ---

    return (
        <div className={styles.shineModalOverlay}>
            {isUploadingPhoto ? (
                <PhotoUpload 
                    onClose={() => setIsUploadingPhoto(false)} 
                    onSubmit={handlePhotoSubmit}
                    userProfile={userProfile}
                />
            ) : (
                <div className={styles.createShineContainer}>
                    {/* HEADER */}
                    <div className={styles.createShineHeader}>
                        <div className={styles.titleHeader}> 
                            <FontAwesomeIcon icon={faStar} className={styles.starIcon}/>
                            <h3>What's Shining Today?</h3>
                        </div>
                        <div className={styles.exitButtonContainer}> 
                            <button className={styles.exitCreatePost} onClick={onClose}>
                                <FontAwesomeIcon icon={faX}/>
                            </button>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className={styles.createShineBody}>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                placeholder="Share your shine/win here..."
                                value={shineText}
                                onChange={(e) => setShineText(e.target.value)}
                                rows={4}
                                required
                                disabled={isPending} // Use isPending from hook
                            ></textarea>

                            {/* PHOTO PREVIEW */}
                            <div className={styles.photoContainerShine}>
                                {mediaPreview && (
                                    <img 
                                        src={mediaPreview} 
                                        alt="Preview" 
                                        className={styles.uploadedPhotoPost}
                                    />
                                )}
                            </div>

                            {/* FOOTER / BUTTONS */}
                            <div className={styles.submissionsFooter}>
                                <div className={styles.photoUpload}>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsUploadingPhoto(true)}
                                        disabled={isPending}
                                    >
                                        <FontAwesomeIcon icon={faCamera} />
                                    </button>
                                </div>
                                <div className={styles.shinePost}>
                                    <button 
                                        type="submit" 
                                        disabled={isPending || shineText.trim() === ''}
                                    >
                                        {isPending ? 'Posting...' : 'Post!'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}