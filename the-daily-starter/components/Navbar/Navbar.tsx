import { useState } from "react";
import styles from './Navbar.module.css';
import Image from "next/image";
import sunshine from '@/public/logo2.png'
import SearchBar from "./SearchBar.tsx/SearchBar";

const Navbar = () => {
    return(
        <nav className={styles.navbarContainer}>
            <div className={styles.navbarLogo}>
                <Image src={sunshine} alt="navbar logo" width="100" height="100"/>
            </div>
            <div className={styles.navbarSearch}>
                <SearchBar/>
            </div>
        </nav>
    )
}

export default Navbar;