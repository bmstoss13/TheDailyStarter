"use client"

import Navbar from '@/components/Navbar/Navbar';
import styles from './CheckListPage.module.css';
import { useAuthContext } from '@/hooks/authProvider';
import { useProfile } from '@/hooks/useProfile';
import CheckListLayout from './components/CheckListLayout';
import { DailyTask, TaskType } from '@/lib/firebase/interfaces';
import DailyTaskModal from './components/tasks/body/daily/modal/DailyTaskModal';
import { getJsonApi } from '@/lib/routes/routes';
import { useCreateDailyTask, useDailyTasks, useDeleteDailyTask, useRecommendations } from '@/hooks/DailyTasks/useDailyTasks';
import { useUIStore } from '@/hooks/useUIStore';

const api = getJsonApi();

export default function CheckListPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile} = useProfile();

    const {
        data: userDailyTasks,
        isLoading: isLoadingTasks,
        error: errorTasks
    } = useDailyTasks();

    const {
        data: recommendations,
        isLoading: isLoadingRecommendations,
        error: errorRecommendations
    } = useRecommendations();

    const {
        isAddingDailyTask,
        setIsAddingDailyTask,
        taskType,
        setTaskType
    } = useUIStore();

    const createDailyTaskMutation = useCreateDailyTask();
    const deleteDailyTaskMutation = useDeleteDailyTask();

    // handler for switching task/list type (daily, schedule, bucket)
    const handleSwitchTaskType = (switchType: TaskType) => {
        try{
            setTaskType(switchType)
        } catch (err) {
            console.error(`error switching type of task to ${switchType}: `, err);
        }
    }

    const handleCreateDailyTask = async (dailyTaskData: DailyTask) => {
        createDailyTaskMutation.mutate(dailyTaskData);
        setIsAddingDailyTask(false);
    }

    const handleDeleteDailyTask = async (taskId: string) => {
        deleteDailyTaskMutation.mutate(taskId);
    }

    const handleToggleAddDailyTask = () => {
        if(isAddingDailyTask) return;
        try{
            setIsAddingDailyTask(true);
        } catch (err) {
            console.error("error while toggling to add task: ", err);
        }
    }

    const handleCloseAddDailyTaskModal = () => {
        if(!isAddingDailyTask) return;
        try{
            setIsAddingDailyTask(false)
        } catch (err) {
            console.error(`error closing add daily task modal: ${err}`)
        } 
    }

    return(
        <main className={styles.listPage}>
            {user && userProfile && (
                <>
                    <Navbar userProfile={user}/>
                    <CheckListLayout 
                        user={userProfile}
                        userDailyTasks={userDailyTasks ?? null} //placeholder - should be user.dailyTasks retrieved from db
                        recommendations={recommendations}
                        taskType={taskType}
                        onSwitchTaskType={handleSwitchTaskType}
                        onToggleDailyTaskModal={handleToggleAddDailyTask}
                        onDeleteDailyTask={handleDeleteDailyTask}
                    />
                </> 
            )}
            {isAddingDailyTask && userProfile && (
                <>
                    <DailyTaskModal
                        onCloseModal={handleCloseAddDailyTaskModal}
                        onAddDailyTask={handleCreateDailyTask}
                        user={userProfile}
                    />
                </>
            )}

        </main>
    )
}