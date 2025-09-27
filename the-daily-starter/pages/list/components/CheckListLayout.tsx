
import styles from "./CheckListLayout.module.css";
import StatBar from "./stats/StatBar";

/**
 * Layout for the Task page
 * Display stat bar on left, main column for list in center, and recommendation bar
 * on the right
 */

export default function CheckListLayout(){
    return(
        <main className={styles.checkListContainer}>
            <div className={styles.statBarColumn}>
                <StatBar />
            </div>
            <div>
                            
            </div>
                        
        </main>
    )
};
