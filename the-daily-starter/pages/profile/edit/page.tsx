// pages/EditPage.tsx
import { useState } from "react";

import { useRouter } from "next/router";
import { useAuthContext } from "@/hooks/authProvider";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/Navbar/Navbar";
import EditProfileForm from "@/components/EditProfileForm/EditProfileForm"; // Import the new component

import styles from './EditPage.module.css'; // Assuming this now only contains page-level styles
import ChangeNameModal from "@/components/EditProfileForm/Modals/ChangeName";

export default function EditPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile } = useProfile();
    const [ isEdittingName, setIsEditingName ] = useState(false);
    
    const router = useRouter();

    if (authLoading || loadingProfile) {
        return <p>Loading profile...</p>;
    }

    if (authError || errorProfile) {
        return <p>Error loading profile: {authError?.message || errorProfile?.message}</p>;
    }

    if (!user || !userProfile) {
        return <p>Please login to edit this profile.</p>;
    }

    const handleSave = () => {
        try {
            router.push('/profile/page');
        } catch (err: any) {
            console.error("An error occurred while saving profile information: ", err);
        }
    };

    const handleBack = () => {
        try {
            router.push('/profile/page');
        } catch (err: any) {
            console.error("An error occurred while navigating back to profile page: ", err);
        }
    };

    const handleEditName = () => {
        setIsEditingName(true);
    }

    const handleCloseEditNameModal = () => {
        setIsEditingName(false);
    }

    return (
        <>
            <div className={styles.pageWrapper}>
                <Navbar />
                <div className={styles.editPageContainer}>
                    <EditProfileForm 
                        userProfile={userProfile} 
                        onSave={handleSave} 
                        onBack={handleBack}
                        onEditName={handleEditName}
                    />
                </div>
            </div>
            {isEdittingName && (
                <ChangeNameModal
                    userProfile={userProfile}
                    onClose={handleCloseEditNameModal}
                />
            )}
        </>

    );
}