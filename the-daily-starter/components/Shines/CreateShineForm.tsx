"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import styles from "./CreateShineForm.module.css";

interface CreateShineFormProps {
    onShinePosted: () => void //set callback to notify parent aka refresh feed.
}

export default function CreateShineForm({ onShinePosted }: CreateShineFormProps){
    const [shineText, setShineText] = useState('');
    const [mediaURL, setMediaURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault;
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
            if(!currentUser) {
                throw new Error ("You must be logged in to post a shine.");
            };

            const idToken = await currentUser.getIdToken();

            const response = await fetch('/api/shines/shines', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`, 
                },
                body: JSON.stringify({
                    text: shineText.trim(),
                    mediaURL: mediaURL.trim() || undefined,
                    
                }),
            });

            const data = await response.json();

            if(!response.ok){
                throw new Error (data.error || data.message || "Failed to post shine.");
            }
            
            //Clear the form.
            setShineText('');
            setMediaURL('');
            setSuccess('Shine posted successfully!');
            onShinePosted(); //Parent! Refresh!


        } catch (err: any){
            console.error("An error occurred while posting shine: ", err);
            setError(err.message || "An unexpected error occurred while posting form");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className={styles.createShineContainer}>
            <h3>What's Shining Today?</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Share your shine here..."
                    value={shineText}
                    onChange={(e) => setShineText(e.target.value)}
                    rows={4}
                    required
                    disabled={isLoading}
                ></textarea>
                {/* Optional: Add input for media URL (or actual file upload later) */}
                <input
                type="url"
                    placeholder="Optional: Image or video URL"
                    value={mediaURL}
                    onChange={(e) => setMediaURL(e.target.value)}
                    disabled={isLoading}
                />
                
                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Posting...' : 'Post Shine'}
                </button>
            </form>
        </div>
    );
}