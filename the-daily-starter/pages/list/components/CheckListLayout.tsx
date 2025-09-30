
import { RecommendationBlueprint, TaskType, UserProfileData } from "@/lib/firebase/interfaces";
import styles from "./CheckListLayout.module.css";
import RecommendationContainer from "./recommendations/RecommendationContainer";
import StatBar from "./stats/StatBar";
import TaskContainer from "./tasks/TaskContainer";
import { useEffect, useState } from "react";
import { defaultRecommendations } from "@/pages/api/defaultRec";

interface CheckListLayoutProps{
    user: UserProfileData
}
/**
 * Layout for the Task page
 * Display stat bar on left, main column for list in center, and recommendation bar
 * on the right
 */

export default function CheckListLayout(){
    const [taskType, setTaskType] = useState<TaskType>('daily');
    const [recommendations, setRecommendations] = useState<RecommendationBlueprint[] | null>(null)

    // handler for switching task/list type (daily, schedule, bucket)
    const handleSwitchTaskType = (switchType: TaskType) => {
        try{
            setTaskType(switchType)
        } catch (err) {
            console.error(`error switching type of task to ${switchType}: `, err);
        }
    }

    const handleRetrieveRecommendations = () => {
        try{
            // Placeholder code for recommendations - should come from backend as processed data
            setRecommendations(defaultRecommendations)
        } catch (err) {
            console.error("error fetching recommendations: ", err)
        }
    }

    useEffect(() => {
        handleRetrieveRecommendations();
    }, [])

    return(
        <main className={styles.checkListContainer}>
            <div className={styles.statBarColumn}>
                <StatBar />
            </div>
            <div className={styles.taskColumn}>
                <TaskContainer 
                    taskType={taskType} 
                    onSwitchTaskType={handleSwitchTaskType}
                />                            
            </div>
            <div className={styles.recommendationColumn}>
                <RecommendationContainer
                    taskType={taskType} 
                    onSwitchTaskType={handleSwitchTaskType}
                    recommendations={recommendations}
                />
            </div>
                        
        </main>
    )
};
