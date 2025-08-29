import { useState } from "react";
import styles from './Navbar.module.css';
import SearchBar from "./SearchBar.tsx/SearchBar";
import { signOutUser } from "@/lib/firebase/clientUtils/authService";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUser, faListAlt } from "@fortawesome/free-regular-svg-icons";
import { faHouse as faHouseSolid, faUser as faUserSolid, faListAlt as faListSolid } from "@fortawesome/free-solid-svg-icons";

import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { User } from "firebase/auth";

interface NavbarProps{
    userProfile: User
}

const Navbar = ({userProfile}: NavbarProps) => {
    // No need for local state like `isClicked`
    
    const router = useRouter();
    const currentPath = router.pathname; // Get the current path

    const handleLogout = async() => {
        try{
            await signOutUser();
            router.push('/');
        } catch (err: any){
            console.error("Logout failed: ", err);
        }
    }

    const handleViewProfile = () => {
        router.push('/profile/page')
    }

    const handleViewFeed = () => {
        router.push('/feed/page')
    }

    const isActive = (path: string) => currentPath === path;

    return(
        <nav className={styles.navbarContainer}>
            <div className={styles.navbarLogo}>
                <img src="/logo2.png" alt="navbar logo" width="60" height="60" className={styles.logo}/>
            </div>
            <div className={styles.navbarSearch}>
                <SearchBar userProfile={userProfile}/>
            </div>
            <div>
                <button onClick={handleViewFeed} className={`${styles.navbarItem} ${isActive('/feed/page') ? styles.active : ''}`}>
                    {isActive('/feed/page') ? (
                        <FontAwesomeIcon icon={faHouseSolid}/>
                    ) : (
                        <FontAwesomeIcon icon={faHouse}/>
                    )}
                </button>
            </div>
            <div>
                <button onClick={handleViewProfile} className={`${styles.navbarItem} ${isActive('/profile/page') ? styles.active : ''}`}>
                    {isActive('/profile/page') ? (
                        <FontAwesomeIcon icon={faUserSolid}/>
                    ) : (
                        <FontAwesomeIcon icon={faUser}/>
                    )}
                </button>
            </div>
            <div>
                {/* Check for the list page's path */}
                <button onClick={() => router.push('/list/page')} className={`${styles.navbarItem} ${isActive('/list/page') ? styles.active : ''}`}>
                    {isActive('/list/page') ? (
                        <FontAwesomeIcon icon={faListSolid}/>
                    ) : (
                        <FontAwesomeIcon icon={faListAlt}/>
                    )}
                </button>
            </div>
            <div className={styles.logout}>
                <button onClick={handleLogout} className={styles.navbarItem}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                </button>
            </div>
        </nav>
    )
}

export default Navbar;