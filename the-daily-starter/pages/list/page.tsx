import Navbar from '@/components/Navbar/Navbar';
import styles from './CheckListPage.module.css';
import { useAuthContext } from '@/hooks/authProvider';
import { useProfile } from '@/hooks/useProfile';
import CheckListLayout from './components/CheckListLayout';

export default function CheckListPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile} = useProfile();
    return(
        <main className={styles.listPage}>
            {user && (
                <>
                    <Navbar userProfile={user}/>
                    <CheckListLayout />
                </> 
            )}

        </main>
    )
}