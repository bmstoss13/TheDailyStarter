import { createContext, useContext, useState, useEffect } from "react";
import { User } from 'firebase/auth';
import { UserProfileData } from "@/lib/firebase/interfaces";
import { useAuth } from "./useAuth";
import { useAuthContext } from "./authProvider";
import axios from "axios"

interface ProfileContextType {
    userProfile: UserProfileData | null;
    loadingProfile: boolean;
    errorProfile: Error | null;
    refetchProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType|undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    // Correctly get user from AuthContext
    const { user, loading: authLoading } = useAuthContext();
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState<Error | null>(null);

    const fetchUserProfile = async () => {
        setLoadingProfile(true);
        setErrorProfile(null);
        try {
            // Check for user before attempting to get the ID token
            if (!user) {
                setLoadingProfile(false);
                return;
            }
            const idToken = await user.getIdToken();
            const response = await axios.get(`http://localhost:8080/api/users/${user.uid}`, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            setUserProfile(response.data);
        } catch (err: any) {
            setErrorProfile(err);
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        // Only run the fetch function when the auth state is not loading and a user exists
        if (!authLoading && user) {
            fetchUserProfile();
        } else if (!user) {
            // Clear profile data if user logs out
            setUserProfile(null);
            setLoadingProfile(false);
        }
    }, [user, authLoading]);

    const refetchProfile = () => {
        if (user) {
            fetchUserProfile();
        }
    };

    return (
        <ProfileContext.Provider value={{ userProfile, loadingProfile, errorProfile, refetchProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};