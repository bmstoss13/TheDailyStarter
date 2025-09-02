"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import axios from "axios";

import styles from "./CreateShineForm.module.css";
import { ShineData, ShineDataWithRayStatus, UserProfileData } from "@/lib/firebase/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faStar, faX } from "@fortawesome/free-solid-svg-icons";
import PhotoUpload from "./PhotoUpload";

interface CreateShineFormProps {
    onShinePosted: (newShine: ShineDataWithRayStatus) => void //set callback to notify parent aka refresh feed.
    onClose: () => void
    userProfile: UserProfileData
}

export default function CreateShineForm({ onShinePosted, onClose, userProfile }: CreateShineFormProps){
    const [shineText, setShineText] = useState('');
    const [mediaURL, setMediaURL] = useState('');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState('')
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if(!shineText.trim()){
            setError("Cannot post Shine without text.");
            setIsLoading(false);
            return;
        }
        
        try{
            const currentUser = auth.currentUser;
            console.log("current user: " + currentUser)
            if(!currentUser) {
                throw new Error ("You must be logged in to post a shine.");
            };

            const idToken = await currentUser.getIdToken();
            const url = `http://localhost:8080/v1/shines`;

            const formData = new FormData();
            formData.append("text", shineText.trim())
            if (mediaFile) {
                formData.append("photo", mediaFile)
            }

            const response = await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            })

            const data:ShineDataWithRayStatus = await response.data;

            const hydratedShine: ShineDataWithRayStatus = {
                ...data,
                username: userProfile.username,
                userPhotoUrl: userProfile.photoURL,
            };


            setShineText('');
            setMediaURL('');
            setSuccess('Shine posted successfully!');
            onShinePosted(hydratedShine); //Parent! Refresh!

        } catch (err: any){
            if(axios.isAxiosError(err) && err.response){
                const errorData = err.response.data;
                console.error("An error occurred while posting shine: ", err.response);
                setError(errorData.message || errorData.error || "Failed to post shine.");
            } else {
                console.error("An unexpected error occurred: ", err);
                setError(err.message || "An unexpected error occurred while posting form");
            }
        } finally {
            setIsLoading(false);
            onClose();
        }
    }

    const handlePhotoUpload = () => {
        setIsUploadingPhoto(true);
        
    }

    const handlePhotoClose = () => {
        setIsUploadingPhoto(false);
    }
    return (
        <div className={styles.shineModalOverlay}>
            {isUploadingPhoto ? (
                <PhotoUpload 
                    onClose={handlePhotoClose} 
                    onSubmit={(file) => {
                        setMediaFile(file);
                        setMediaPreview(URL.createObjectURL(file));
                        setIsUploadingPhoto(false)
                    }}
                    userProfile={userProfile}
                />
            ):(
                <div className={styles.createShineContainer}>
                    <div className={styles.createShineHeader}>
                        <div className={styles.titleHeader}> 
                            <FontAwesomeIcon icon={faStar} className={styles.starIcon}/>
                            <h3>What's Shining Today?</h3>
                        </div>
                        <div className={styles.exitButtonContainer}> 
                            <button  className={styles.exitCreatePost} onClick={onClose}>
                                <FontAwesomeIcon icon={faX}/>
                            </button>

                        </div>


                    </div>
                    <div className={styles.createShineBody}>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                placeholder="Share your shine/win here..."
                                value={shineText}
                                onChange={(e) => setShineText(e.target.value)}
                                rows={4}
                                required
                                disabled={isLoading}
                            ></textarea>
                            <div className={styles.photoContainerShine}>
                                {mediaPreview && (
                                    <img src={mediaPreview} className={styles.uploadedPhotoPost}/>
                                )}

                            </div>
                            <div className={styles.submissionsFooter}>
                                <div className={styles.photoUpload}>
                                    <button onClick={handlePhotoUpload}>
                                        <FontAwesomeIcon icon={faCamera} />
                                    </button>
                                </div>
                                <div className={styles.shinePost}>
                                    <button type="submit" disabled={isLoading || shineText === ''}>
                                        {isLoading ? 'Posting...' : 'Post!'}
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