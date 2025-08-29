import { UserProfileData } from "@/lib/firebase/interfaces"
import styles from "./FeedBanner.module.css"

interface FeedBannerProps {
    onClickShine: () => void
    userProfile: UserProfileData
}
const FeedBanner = ({onClickShine, userProfile}: FeedBannerProps) => {
    return (
        <div className={styles.bannerWrapper}>
            <div className={styles.feedBannerContainer}>
                <div className={styles.complimentLayout}>
                    <div className={styles.complimentContainer}>
                        <div>
                            Looking Great, {userProfile.firstName}!
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