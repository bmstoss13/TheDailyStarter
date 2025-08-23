"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import AuthForm from "@/components/AuthForm/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import styles from "./index.module.css";
import logo from "@/public/sunshine.svg"
import Image from "next/image";

export default function Home() {
    const { user, loading: authLoading, error: authError } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
        // Redirect authenticated users straight to feed
            router.push("/feed/page");
        }
    }, [user, router]);

    // Loading state
    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <p>Loading user session...</p>
            </div>
        );
    }

    // Auth error
    if (authError) {
        return (
            <div className={styles.errorContainer}>
                <h2>Authentication Error</h2>
                <p>{authError.message}</p>
                <p>Please try refreshing the page or logging in again.</p>
            </div>
        );
    }

    // If no user, show login form
    return (
        <main className={styles.mainContainer}>
            <h1 className={styles.appHeader}>Sun<Image src={logo} alt={'Sunshine logo'} className={styles.logo}/> </h1>
            {!user && (
                <div className={styles.authContainer}>
                <AuthForm />
                </div>
            )}
        </main>
    );
}
