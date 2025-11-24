"use client";

import React, { useEffect, useRef } from 'react';
import styles from './FeedLayout.module.css';
import Navbar from '@/components/Navbar/Navbar';
import FeedBanner from '@/components/Shines/FeedBanner';
import ShineFeed from '@/components/Shines/ShineFeed';
import DailyNewsFeed from './DailyNews/DailyNewsFeed';
import MiniListCard from './MiniList/MiniListCard';
import CreateShineForm from '@/components/Shines/CreateShineForm';
import { NewsData, ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import { User } from 'firebase/auth';

interface FeedLayoutProps {
    user: User;
    userProfile: UserProfileData;
    shines: ShineDataWithRayStatus[];
    isLoadingFeed: boolean;
    error: string | null;
    hasMore: boolean;
    bannerMessage: string;
    newsData: NewsData[] | null;
    isFormModal: boolean;
    selectedShine: ShineDataWithRayStatus | null;
    sentinelRef: React.Ref<HTMLDivElement>;
    handleOpenFormModal: () => void;
    // handleShinePosted: (newShine: ShineDataWithRayStatus) => void;
    // handleShineUpdated: (updated: ShineDataWithRayStatus) => void;
    // handleShineDeleted: (id: string) => void;
    handleOpenComments: (shine: ShineDataWithRayStatus) => void;
    handleCloseFormModal: () => void;
    handleCloseCommentModal: () => void;
}

export default function FeedLayout({
    user,
    userProfile,
    shines,
    isLoadingFeed,
    error,
    hasMore,
    bannerMessage,
    newsData,
    isFormModal,
    sentinelRef,
    handleOpenFormModal,
    // handleShinePosted,
    // handleShineUpdated,
    // handleShineDeleted,
    handleOpenComments,
    handleCloseFormModal,
}: FeedLayoutProps) {
    const listColumnRef = useRef<HTMLDivElement>(null);
    const listCardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const listColumn = listColumnRef.current;
        const listCardContainer = listCardContainerRef.current;

        if (listColumn && listCardContainer) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const newWidth = entry.borderBoxSize[0].inlineSize;
                    listCardContainer.style.width = `${newWidth}px`;
                }
            });

            resizeObserver.observe(listColumn);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    return (
        <>
            <Navbar userProfile={user}/>
            <div className={styles.feedLayout}>
                <div className={styles.listColumn} ref={listColumnRef}>
                    <div className={styles.listCardContainer} ref={listCardContainerRef}>
                        <MiniListCard userProfile={userProfile!}/>
                    </div>
                </div>
                <div className={styles.feedColumn}>
                    <FeedBanner 
                        onClickShine={handleOpenFormModal} 
                        userProfile={userProfile} 
                        bannerMessage={bannerMessage} 
                    />
                    {/* {isFormModal && (
                        <CreateShineForm 
                        onShinePosted={handleShinePosted} 
                        onClose={handleCloseFormModal} userProfile={userProfile}/>
                    )} */}
                    <ShineFeed
                        user={user}
                        shines={shines}
                        isLoadingFeed={isLoadingFeed}
                        error={error}
                        hasMore={hasMore}
                        // onShineUpdated={handleShineUpdated}
                        // onShineDeleted={handleShineDeleted}
                        onCommentsClick={handleOpenComments}
                        userProfile={userProfile}
                    />
                    <div ref={sentinelRef} style={{ height: "1px" }} />
                </div>
                <div className={styles.newsColumn}>
                    {newsData && <DailyNewsFeed dailyNews={newsData} />}
                </div>
            </div>
            {isFormModal && (
                <CreateShineForm 
                    // onShinePosted={handleShinePosted} 
                    onClose={handleCloseFormModal} 
                    userProfile={userProfile} 
                />
            )}
        </>
    );
}