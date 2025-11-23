
import { DailyTask, RecommendationBlueprint, TaskType, UserProfileData } from "@/lib/firebase/interfaces";
import styles from "./CheckListLayout.module.css";
import RecommendationContainer from "./recommendations/RecommendationContainer";
import StatBar from "./stats/StatBar";
import TaskContainer from "./tasks/TaskContainer";
import { useEffect, useState } from "react";
import { defaultRecommendations } from "@/pages/api/defaultRec";

interface CheckListLayoutProps{
    user: UserProfileData;
    userDailyTasks: DailyTask[] | null;
    recommendations: RecommendationBlueprint[] | null;

    taskType: TaskType;
    onSwitchTaskType: (switchType: TaskType) => void;
    onToggleDailyTaskModal: () => void;
}
/**
 * Layout for the Task page
 * Display stat bar on left, main column for list in center, and recommendation bar
 * on the right
 */

export default function CheckListLayout({
    user,
    userDailyTasks,
    recommendations,
    onSwitchTaskType,
    taskType,
    onToggleDailyTaskModal
}:CheckListLayoutProps){

    return(
        <main className={styles.checkListContainer}>
            <div className={styles.statBarColumn}>
                <StatBar user={user}/>
            </div>
            <div className={styles.taskColumn}>
                <TaskContainer 
                    tasks={userDailyTasks}
                    taskType={taskType} 
                    onSwitchTaskType={onSwitchTaskType}
                    onToggleAddDailyTask={onToggleDailyTaskModal}
                />                            
            </div>
            <div className={styles.recommendationColumn}>
                <RecommendationContainer
                    taskType={taskType} 
                    onSwitchTaskType={onSwitchTaskType}
                    recommendations={recommendations}
                />
            </div>
                        
        </main>
    )
};
