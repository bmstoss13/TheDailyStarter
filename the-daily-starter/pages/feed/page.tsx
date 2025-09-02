"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getJsonApi } from '@/lib/routes/routes';
import { User } from 'firebase/auth';

import CreateShineForm from '@/components/Shines/CreateShineForm';
import ShineFeed from '@/components/Shines/ShineFeed';
import QuoteModal from "@/components/Quotes/QuoteModal";

import styles from './FeedPage.module.css';
import Navbar from '@/components/Navbar/Navbar';
import { useAuthContext } from '@/hooks/authProvider';
import { ShineData, ShineDataWithRayStatus } from '@/lib/firebase/interfaces';
import { saveShineFeedToCache, loadShineFeedFromCache } from '@/hooks/feedCache';
import FeedBanner from '@/components/Shines/FeedBanner';
import { useProfile } from '@/hooks/useProfile';
import CommentFeed from '@/components/Shines/Comments/CommentFeed';
import CommentFeedModal from '@/components/Shines/Comments/CommentFeed';

interface DailyQuoteData {
    quote: string;
    author: string;
}

interface LoginFlowResponse {
    dailyQuote?: DailyQuoteData;
    isNewQuote: boolean;
}

const api = getJsonApi();

export default function FeedPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile} = useProfile()
    const [quote, setQuote] = useState<DailyQuoteData | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
    const [shines, setShines] = useState<ShineDataWithRayStatus[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastShineId, setLastShineId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [isFormModal, setIsFormModal] = useState(false);
    const [bannerMessage, setBannerMessage] = useState('');
    const [selectedShine, setSelectedShine] = useState<ShineDataWithRayStatus | null>(null);
    
    const hasInitialFetched = useRef(false);

    const fetchShines = useCallback(async (startAfterId?: string) => {
        if (!user) return;

        setIsLoadingFeed(true);
        setError(null);

        try {
            const idToken = await user.getIdToken();
            const { data } = await api.get<ShineDataWithRayStatus[]>(`/v1/shines`, {
                params: {
                    limit: 10,
                    startAfter: startAfterId,
                },
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            setShines((prev) => {
                const combined = startAfterId ? [...prev, ...data] : data;
                const unique = Array.from(new Map(combined.map((s) => [s.id, s])).values());
                saveShineFeedToCache(unique);
                return unique;
            })

            // setLastShineId(data.length > 0 ? data[data.length - 1].id : undefined);
            setLastShineId(data.at(-1)?.id);
            setHasMore(data.length === 10);
            
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error("Error fetching shines:", err.response?.data || err.message);
                setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch shines.');
            } else {
                console.error("Unknown error:", err);
                setError('Could not load shines.');
            }
        } finally {
            setIsLoadingFeed(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user || hasInitialFetched.current) return;

        const cachedShines = loadShineFeedFromCache();        
        if (cachedShines?.length) {
            setShines(cachedShines); 
            // const lastId = cachedShines[cachedShines.length - 1].id;
            setLastShineId(cachedShines.at(-1)?.id); //was lastId
            setHasMore(true);
            setIsLoadingFeed(false);
        } else {
            fetchShines(undefined);

        }
        hasInitialFetched.current = true;
        
    }, [user, fetchShines]);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if(!sentinelRef.current || !hasMore || isLoadingFeed) return;
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) fetchShines(lastShineId);
        });

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [lastShineId, hasMore, isLoadingFeed, fetchShines]);

    const handleShinePosted = (newShine: ShineDataWithRayStatus) => {
        setShines((prev) => {
            const updated = [newShine, ...prev];
            saveShineFeedToCache(updated);
            return updated;
        });
    }

    const handleShineUpdated = (updated: ShineDataWithRayStatus) => {
        
        setShines((prev) => {
            const updatedList = prev.map((s) => (s.id === updated.id ? updated : s));
            saveShineFeedToCache(updatedList);
            return updatedList;
        });
    };

    const handleShineDeleted = (id: string) => {
        setShines((prev) => {
            const updatedList = prev.filter(shine => shine.id !== id);
            saveShineFeedToCache(updatedList);
            return updatedList;
        });
    };

    const fetchQuote = async (user: User) => {
        try {
            const idToken = await user.getIdToken();
            const { data } = await api.post<LoginFlowResponse>(
                `/v1/user/login`,
                {},
                {
                    headers: {
                        // 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    }
                }
            );

            // const data = response.data;
            if (data.isNewQuote && data.dailyQuote) {
                setQuote(data.dailyQuote);
                setShowQuoteModal(true);
            }
        } catch (err: any) {
            console.error("Failed to fetch new quote:", err.response?.data || err.message);
        }
    };

    const fetchBannerMessage = async() => {
        const { data } = await api.get(`/v1/banner/message`)
        setBannerMessage(data.message)

    }

    useEffect(() => {
        if (user && !authLoading) {
            fetchQuote(user);
            fetchBannerMessage();
        }
    }, [user, authLoading]);
    

    const handleCloseModal = () => {
        setShowQuoteModal(false);
    };

    const handleOpenFormModal = () => {
        setIsFormModal(true)
    }

    const handleCloseFormModal = () => {
        setIsFormModal(false);
    }

    const handleOpenComments = (shine: ShineDataWithRayStatus) => {

        setSelectedShine(shine);
    }

    const handleCloseCommentModal = () => {
        setSelectedShine(null);
    }

    if (authLoading || loadingProfile) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <h1>Feed</h1>
                <p>Loading user session...</p>
            </div>
        );
    }

    if (authError || errorProfile) {
        return (
            <div className={styles.feedContainer}>
                <h1>Feed</h1>
                <p className={styles.errorMessage}>Error loading user session</p>
                <p>Please try refreshing the page or logging in again.</p>
            </div>
        );
    }



    return (
        <div className={styles.feedContainer}>

            {user && userProfile ? (
                <>
                 <Navbar userProfile={user}/>
                <FeedBanner onClickShine={handleOpenFormModal} userProfile={userProfile} bannerMessage={bannerMessage} />
                {isFormModal && (
                    <CreateShineForm onShinePosted={handleShinePosted} onClose={handleCloseFormModal} userProfile={userProfile}/>
                )}

                    <ShineFeed
                        user={user}
                        shines={shines}
                        isLoadingFeed={isLoadingFeed}
                        error={error}
                        hasMore={hasMore}
                        onShineUpdated={handleShineUpdated}
                        onShineDeleted={handleShineDeleted}
                        onCommentsClick={handleOpenComments}
                        userProfile={userProfile}
                    />

                    <div ref={sentinelRef} style={{ height: "1px" }} />

                </>
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to share your shines!</p>
                </div>
            )}
            {showQuoteModal && quote && (
                <QuoteModal quote={quote} onClose={handleCloseModal} />
            )}

            {selectedShine && userProfile && (
                <CommentFeedModal
                    shine={selectedShine}
                    userProfile={userProfile}
                    onClose={handleCloseCommentModal}

                />
            )}
        </div>
    );
}
