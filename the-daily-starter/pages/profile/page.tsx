import { useAuthContext } from "@/hooks/authProvider";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";

import styles from "./ProfilePage.module.css"
import Navbar from "@/components/Navbar/Navbar";

export default function ProfilePage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const  { userProfile, loadingProfile, errorProfile } = useProfile();

    if(authLoading || loadingProfile){
        return <p> Loading profile... </p>
    }

    if(authError || errorProfile){
        return <p> Error loading profile: {authError?.message || errorProfile?.message}</p>
    }

    if(!user || !userProfile){
        return <p> Please login to view this profile. </p>
    }

    return(
        <div>
            <Navbar/>
            {userProfile?.photoURL && (
                <Image src={userProfile?.photoURL} alt={'Profile'} width={"100"} height={"100"}/>
            )}

        </div>
    )
}