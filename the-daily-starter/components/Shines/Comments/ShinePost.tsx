import { ShineDataWithRayStatus } from "@/lib/firebase/interfaces";
import styles from "./ShinePost.module.css";

interface ShinePostProps {
    shine: ShineDataWithRayStatus;
}

const ShinePost = ({shine}: ShinePostProps) => {
    return (
        <div className={styles.shinePostContainer}>
            <div className={styles.shinePostHeader}>
                <img src={shine.userPhotoUrl || ''} className={styles.shinePosterProfile}/>
                <h1>{shine.username}:</h1>
                <p>{shine.text}</p>
            </div>

        </div>
    )
}

export default ShinePost