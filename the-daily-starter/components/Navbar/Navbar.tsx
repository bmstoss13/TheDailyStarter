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
    return(
        <nav className={styles.navbarContainer}>
            <div className={styles.navbarLogo}>
                <Image src={sunshine} alt="navbar logo" width="60" height="60" className={styles.logo}/>
            </div>
            <div className={styles.navbarSearch}>
                <SearchBar/>
            </div>
            <div>
                Profile
            </div>
            <div>
                Checklist
            </div>
            <div  className={styles.logout}>
                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>

        </nav>
    )
}

export default Navbar;