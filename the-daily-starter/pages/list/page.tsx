import Navbar from '@/components/Navbar/Navbar';
import styles from './CheckListPage.module.css';
import { useAuthContext } from '@/hooks/authProvider';
import { useProfile } from '@/hooks/useProfile';
import CheckListLayout from './components/CheckListLayout';
import { useEffect, useState } from 'react';
import { DailyTask, RecommendationBlueprint, TaskType } from '@/lib/firebase/interfaces';
import { defaultRecommendations } from "@/pages/api/defaultRec";
import { taskList } from './components/tasks/body/daily/DailyTaskContainer';
import DailyTaskModal from './components/tasks/body/daily/modal/DailyTaskModal';
import { getJsonApi } from '@/lib/routes/routes';

const api = getJsonApi();

export default function CheckListPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile} = useProfile();

    const [isAddingDailyTask, setIsAddingDailyTask] = useState<boolean>(false);
    const [userDailyTasks, setUserDailyTasks] = useState<DailyTask[] | null>(taskList);
    const [taskType, setTaskType] = useState<TaskType>('daily');
    const [recommendations, setRecommendations] = useState<RecommendationBlueprint[] | null>(null);

    const [changes, setChanges] = useState<DailyTask[] | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // handler for switching task/list type (daily, schedule, bucket)
    const handleSwitchTaskType = (switchType: TaskType) => {
        try{
            setTaskType(switchType)
        } catch (err) {
            console.error(`error switching type of task to ${switchType}: `, err);
        }
    }

    const handleRetrieveRecommendations = async () => {
        try{
            // Placeholder code for recommendations - should come from backend as processed data
            const { data } = await api.get('/v1/tasks/recommendations')
            setRecommendations(data)
        } catch (err) {
            console.error("error fetching recommendations: ", err)
        }
    }

    useEffect(() => {
        handleRetrieveRecommendations();
    }, [])

    const handleToggleAddDailyTask = () => {
        console.log("toggled")
        if(isAddingDailyTask) return;
        try{
            setIsAddingDailyTask(true);
            console.log("toggling daily task: ", isAddingDailyTask)
        } catch (err) {
            console.error("error while toggling to add task: ", err);
        }
    }

    const handleCloseAddDailyTaskModal = () => {
        if(!isAddingDailyTask) return;
        try{
            setIsAddingDailyTask(false)
            console.log("toggling daily task: ", isAddingDailyTask)
        } catch (err) {
            console.error(`error closing add daily task modal: ${err}`)
        }
    }

        // handler for adding a filled out task to your list (not saved yet)
    const handleAddTask = (task: DailyTask) => {
        try{
            var allChanges: DailyTask[] = changes ? [...changes, task] : [task]

            setChanges(allChanges)
            if(!hasChanges){
                setHasChanges(true)
            }

            setIsAddingDailyTask(false);

        } catch (err) {
            console.error(`error while adding new task, ${task.title}: `, err)
        }
    }

    return(
        <main className={styles.listPage}>
            {user && userProfile && (
                <>
                    <Navbar userProfile={user}/>
                    <CheckListLayout 
                        user={userProfile}
                        userDailyTasks={userDailyTasks} //placeholder - should be user.dailyTasks retrieved from db
                        recommendations={recommendations}
                        taskType={taskType}
                        onSwitchTaskType={handleSwitchTaskType}
                        onToggleDailyTaskModal={handleToggleAddDailyTask}
                    />
                </> 
            )}
            {isAddingDailyTask && (
                <>
                    <DailyTaskModal
                        onCloseModal={handleCloseAddDailyTaskModal}
                        onAddDailyTask={handleAddTask}
                    />
                </>
            )}

        </main>
    )
}