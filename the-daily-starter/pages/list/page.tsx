import Navbar from '@/components/Navbar/Navbar';
import styles from './CheckListPage.module.css';
import { useAuthContext } from '@/hooks/authProvider';
import { useProfile } from '@/hooks/useProfile';

export default function CheckListPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile} = useProfile();
    return(
        <div>
            {user && (
                <>
                    <Navbar userProfile={user}/>
                    <main className={styles.checkListContainer}>

                    </main>
                </> 
            )}

        </div>
    )
}