import { UserProfileData } from "@/lib/firebase/interfaces";

import styles from './ProfileBody.module.css'


interface UserProfileProps {
    userProfile: UserProfileData
}

const ProfileBody = ({userProfile}: UserProfileProps) => {
    return(
        <div className={styles.bodyContainer}>

        </div>
    )
}

export default ProfileBody;