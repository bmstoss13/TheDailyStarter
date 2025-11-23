import { UserProfileData } from "@/lib/firebase/interfaces"
import styles from "./FeedBanner.module.css"
import { useState } from "react"

interface FeedBannerProps {
    onClickShine: () => void
    userProfile: UserProfileData
    bannerMessage: string
}
const FeedBanner = ({onClickShine, userProfile, bannerMessage}: FeedBannerProps) => {
    return (
        <div className={styles.bannerWrapper}>
            <div className={styles.feedBannerContainer}>
                <div className={styles.complimentLayout}>
                    <div className={styles.complimentContainer}>
                        <div>
                            {bannerMessage} {userProfile.firstName}!
                        </div>

                    </div>
                    <div className={styles.postShineContainer}>
                        <button onClick={onClickShine}>
                            Shine!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeedBanner;