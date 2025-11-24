"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getJsonApi } from '@/lib/routes/routes';
import { User } from 'firebase/auth';

import QuoteModal from "@/components/Quotes/QuoteModal";

import styles from './FeedPage.module.css';
import { useAuthContext } from '@/hooks/authProvider';
import { NewsData, ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import { saveShineFeedToCache, loadShineFeedFromCache } from '@/hooks/feedCache';
import { useProfile } from '@/hooks/useProfile';
import CommentFeedModal from '@/components/Shines/Comments/CommentFeedModal';

// New component for the main feed layout and ResizeObserver logic
import FeedLayout from './components/FeedLayout';
import { useUIStore } from '@/hooks/useUIStore';
import { useBannerMessage, useDailyNews, useDailyQuote, useShinesFeed } from '@/hooks/ShineFeed/useShines';
import { useInView } from 'react-intersection-observer';

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
    const { userProfile, loadingProfile, errorProfile} = useProfile();
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const {
        isQuoteModalOpen, closeQuoteModal,
        isFormModalOpen, openFormModal, closeFormModal,
        selectedShine, openComments, closeComments
    } = useUIStore();

    const {
        data: shinesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isFeedLoading,
        error: feedError
    } = useShinesFeed();

    const { data: quote } = useDailyQuote();
    const { data: newsData } = useDailyNews();
    const { data: bannerMessage } = useBannerMessage();

    const { ref: sentinelRef, inView } = useInView();
    useEffect(() => {
        const shouldLock = selectedShine || isQuoteModalOpen || isFormModalOpen;
        document.body.style.overflow = shouldLock ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedShine, isQuoteModalOpen, isFormModalOpen]);

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const shines = shinesData?.pages.flat() || []

    if (authLoading || loadingProfile) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <h1>Feed</h1>
                <p>Loading user session...</p>
            </div>
        );
    }

    if (authError || errorProfile || feedError) {
        const errorMessage =
            (authError as Error)?.message ||
            (errorProfile as Error)?.message || 
            (feedError as Error)?.message || 
            "Error loading feed.";

        return (
            <div className={styles.feedContainer}>
                <p className={styles.errorMessage}>{errorMessage}</p>
                <p>Please try refreshing the page or logging in again.</p>
            </div>
        );
    }

    return (
        <div className={styles.feedContainer}>
            {user && userProfile && sentinelRef ? (
                <FeedLayout
                    user={user}
                    userProfile={userProfile}
                    shines={shines}
                    isLoadingFeed={isFeedLoading}
                    error={error}
                    hasMore={hasMore}
                    bannerMessage={bannerMessage}
                    newsData={newsData}
                    isFormModal={isFormModalOpen}
                    selectedShine={selectedShine}
                    sentinelRef={sentinelRef}
                    handleOpenFormModal={openFormModal}
                    handleCloseFormModal={closeFormModal}
                    handleOpenComments={openComments}                
                    
                    handleCloseCommentModal={closeComments}
                />
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to share your shines!</p>
                </div>
            )}
            {isQuoteModalOpen && quote && (
                <QuoteModal quote={quote} onClose={closeQuoteModal} />
            )}
            {selectedShine && userProfile && user && (
                <CommentFeedModal
                    shine={selectedShine}
                    userProfile={userProfile}
                    onClose={closeComments}
                    user={user}
                />
            )}
        </div>
    );
}