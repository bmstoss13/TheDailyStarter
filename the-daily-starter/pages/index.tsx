"use client";

import { useState, useEffect } from "react";
import { auth } from '@/lib/firebase/firebase';
import { useRouter } from 'next/router'; // Import useRouter
import AuthForm from "@/components/AuthForm/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import styles from "./index.module.css";
import QuoteModal from "@/components/Quotes/QuoteModal"

interface DailyQuoteData {
    q: string;
    a: string;
}

export default function Home() {
    const [quote, setQuote] = useState<DailyQuoteData | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
    const { user, loading: authLoading, error: authError } = useAuth();
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        const handleLoginFlow = async() => {
            if(!user){
                return;
            }
            const response = await fetch(`/api/login-flow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ uid: user.uid })
            })

            if(!response.ok){
                throw new Error('Login flow API call failed.');
            }

            const data = await response.json();
            if(data.isNewQuote){
                setQuote(data.quote);
                setShowQuoteModal(true);
            } else {
                router.push('/feed/page');
            }
            try{
                
            } catch (err: any){
                console.error("An error occurred while handling login flow: ", err);
                router.push('/feed/page');
            }
        }
        handleLoginFlow();
    }, [user, router]); // Add router to dependency array for useEffect

    const handleCloseModal = () => {
        setShowQuoteModal(false);
        router.push('/feed/page');
    }

    //loading
    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <p>Loading user session...</p>
            </div>
        );
    }

    //Auth error
    if (authError) {
        return (
        <div className={styles.errorContainer}>
            <h2>Authentication Error</h2>
            <p>{authError.message}</p>
            <p>Please try refreshing the page or logging in again.</p>
        </div>
        );
    }

    return (
        <main className={styles.mainContainer}>
            <h1 className={styles.appHeader}>Sunshine</h1>
            
            {!user ? (
                <div className={styles.authContainer}>
                    <AuthForm />
                </div>
            ) : (
                <>
                    {showQuoteModal && quote && (
                        <QuoteModal quote={quote} onClose={handleCloseModal} />
                    )}
                    {!showQuoteModal && (
                        <p>Redirecting to feed...</p>
                    )}
                </>
            )}
        </main>
    );
}
