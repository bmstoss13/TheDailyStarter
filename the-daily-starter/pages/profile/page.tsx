import { useState } from "react";

import { useAuthContext } from "@/hooks/authProvider";
import { useProfile } from "@/hooks/useProfile";

import styles from "./ProfilePage.module.css"
import Navbar from "@/components/Navbar/Navbar";
import ProfileHeader from './components/ProfileHeader'
import ProfileBody from "./components/ProfileBody";
import ProfileSettingsModal from "./components/settings/ProfileSettings";

export default function ProfilePage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const  { userProfile, loadingProfile, errorProfile } = useProfile();
    const [ isClickingSettings, setIsClickingSettings ] = useState(false)

    if(authLoading || loadingProfile){
        return <p> Loading profile... </p>
    }

    if(authError || errorProfile){
        return <p> Error loading profile: {authError?.message || errorProfile?.message}</p>
    }

    if(!user || !userProfile){
        return <p> Please login to view this profile. </p>
    }

    const handleClickingSettings = () => {
        setIsClickingSettings(true);
        console.log(`is clicking settings: ${isClickingSettings}`);
    }

    const handleDeleteUser = () => {
        return;
    }

    const handleCloseModal = () => {
        setIsClickingSettings(false);
    }


    return(
        <div>
            <Navbar/>
            <div>
                <div className={styles.profileLayout}>
                    <ProfileHeader userProfile={userProfile} onSettingsClick={handleClickingSettings}/>
                    <ProfileBody userProfile={userProfile}/>              
                </div>
                <div className={styles.sideMenu}>

                </div>
            </div>
            {isClickingSettings && (
                <ProfileSettingsModal
                    currentUser={userProfile}
                    onClose={handleCloseModal}
                    onDelete={handleDeleteUser}
                />
            )}
        </div>
    )
}