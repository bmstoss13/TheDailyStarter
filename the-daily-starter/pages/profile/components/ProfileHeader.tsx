import { lazy, useState } from "react";

import { UserProfileData } from "@/lib/firebase/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPencil } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import styles from './ProfileHeader.module.css'


interface UserProfileProps {
    userProfile: UserProfileData;
    onSettingsClick: (user: UserProfileData) => void;
    onEditClick: (user: UserProfileData) => void;
}

const ProfileHeader = ({userProfile, onSettingsClick, onEditClick}: UserProfileProps) => {


    return(

            <div className={styles.profileHeaderContainer}>
                {userProfile?.photoURL && (
                    <Image src={userProfile?.photoURL} alt={'Profile'} width={"150"} height={"150"} className={styles.profilePicture} loading={"lazy"}/>
                )}
                <div className={styles.rightContainer}>
                    <div className={styles.usernameContainer}>
                        <div className={styles.profileUsername}>
                            <h2>{userProfile.username}</h2>
                        </div>
                            <div className={styles.rightTools}>
                                <div className={styles.settingsGear}>
                                    <button>
                                        <FontAwesomeIcon icon={faPencil} onClick={() => onEditClick(userProfile)} />
                                    </button>
                                </div>

                                <div className={styles.settingsGear}>
                                    <button>
                                        <FontAwesomeIcon icon={faGear} onClick={() => onSettingsClick(userProfile)} />
                                    </button>
                                </div>

                        </div>
                    </div>
                    <div className={styles.firstLastName}>
                        <p>{userProfile.firstName} {userProfile.lastName}</p>
                    </div>
                    <div className={styles.aboutMe}>
                        I love software engineering!
                    </div>
                    <div className={styles.publicStatsContainer}>
                        <div className={styles.publicStats}>
                            <p className={styles.stat}>2</p>
                            <p className={styles.statText}>Followers</p>
                        </div>
                        <div className={styles.publicStats}>
                            <p className={styles.stat}>2</p>
                            <p className={styles.statText}>Shines</p>
                        </div>
                        <div className={styles.publicStats}>
                            <p className={styles.stat}>8</p>
                            <p className={styles.statText}>Rays</p>
                        </div>
                    </div>
                </div>

            </div>                
    )
}

export default ProfileHeader