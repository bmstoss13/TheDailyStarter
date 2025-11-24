"use client";

import { useState } from "react";
import { useRouter } from "next/router";

import { useAuthContext } from "@/hooks/authProvider";
import { useProfile } from "@/hooks/useProfile";

import styles from "./ProfilePage.module.css"
import Navbar from "@/components/Navbar/Navbar";
import ProfileHeader from './components/ProfileHeader'
import ProfileBody from "./components/ProfileBody";
import ProfileSettingsModal from "./components/settings/ProfileSettings";
import EditModal from "./components/edit/EditModal";

export default function ProfilePage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const  { userProfile, loadingProfile, errorProfile } = useProfile();
    const [ isClickingSettings, setIsClickingSettings ] = useState(false)
    const [ isClickingEdit, setIsClickingEdit ] = useState(false)

    const router = useRouter();

    if(authLoading || loadingProfile){
        return <p> Loading profile... </p>
    }

    if(authError || errorProfile){
        return <p> Error loading profile: {authError?.message || errorProfile?.message}</p>
    }

    if(!user || !userProfile){
        return <p> Please login to view this profile. </p>
    }

    const handleClickingEdit = () => {
        if(isClickingSettings){
            setIsClickingSettings(false);
        }
        try{
            router.push('/profile/edit/page')
        } catch (err: any) {
            console.error("An error occurred while navigating to the edit page");
        }
    }

    const handleClickingSettings = () => {
        setIsClickingSettings(true);
        console.log(`is clicking settings: ${isClickingSettings}`);
    }

    const handleDeleteUser = () => {
        return;
    }

    const handleCloseSettingsModal = () => {
        setIsClickingSettings(false);
    }

    const handleCloseEditModal = () => {
        setIsClickingEdit(false);
    }


    return(
        <div>
            <Navbar userProfile={user}/>
            <div>
                <div className={styles.profileLayout}>
                    <ProfileHeader userProfile={userProfile} onSettingsClick={handleClickingSettings} onEditClick={handleClickingEdit}/>
                    <ProfileBody userProfile={userProfile}/>              
                </div>
                <div className={styles.sideMenu}>

                </div>
            </div>
            {isClickingSettings && (
                <ProfileSettingsModal
                    currentUser={userProfile}
                    onEdit={handleClickingEdit}
                    onClose={handleCloseSettingsModal}
                    onDelete={handleDeleteUser}
                />
            )}

            {isClickingEdit && (
                <EditModal
                    currentUser={userProfile}
                    onClose={handleCloseEditModal}
                />
            )}
        </div>
    )
}