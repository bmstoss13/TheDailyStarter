import { useState } from "react";
import styles from './Navbar.module.css';
import Image from "next/image";
import sunshine from '@/public/logo2.png'
import SearchBar from "./SearchBar.tsx/SearchBar";
import { signOutUser } from "@/lib/firebase/clientUtils/authService";
import { useRouter } from "next/router";

const Navbar = () => {
    
    const router = useRouter();

    const handleLogout = async() => {
        try{
            await signOutUser();
            router.push('/');
        } catch (err: any){
            console.error("Logout failed: ", err);
        }
    }

    const handleViewProfile = () => {
        try{
            router.push('/profile/page')
        } catch (err: any) {
            console.error("Unable to view profiel: ", err)
        }
    }

    const handleViewFeed = () => {
        try{
            router.push('/feed/page')
        } catch (err: any) {
            console.error("Could not view feed: ", err)
        }
    }
    return(
        <nav className={styles.navbarContainer}>
            <div className={styles.navbarLogo}>
                <img src="/logo2.png" alt="navbar logo" width="60" height="60" className={styles.logo}/>
            </div>
            <div className={styles.navbarSearch}>
                <SearchBar/>
            </div>
            <div >
                <button onClick={handleViewFeed} className={styles.navbarItem}>
                    Feed
                </button>
            </div>
            <div>
                <button onClick={handleViewProfile} className={styles.navbarItem}>
                    Profile
                </button>
            </div>
            <div className={styles.navbarItem}>
                Checklist
            </div>
            <div className={styles.logout}>
                <button onClick={handleLogout} className={styles.navbarItem}>
                    Logout
                </button>
            </div>

        </nav>
    )
}

export default Navbar;