"use client"

import Navbar from '@/components/Navbar/Navbar';
import styles from './CheckListPage.module.css';
import { useAuthContext } from '@/hooks/authProvider';
import { useProfile } from '@/hooks/useProfile';
import CheckListLayout from './components/CheckListLayout';
import { useEffect, useState } from 'react';
import { DailyTask, RecommendationBlueprint, TaskType } from '@/lib/firebase/interfaces';
import DailyTaskModal from './components/tasks/body/daily/modal/DailyTaskModal';
import { getJsonApi } from '@/lib/routes/routes';
import axios from 'axios';

const api = getJsonApi();

export default function CheckListPage() {
    const { user, loading: authLoading, error: authError } = useAuthContext();
    const { userProfile, loadingProfile, errorProfile} = useProfile();

    const [isAddingDailyTask, setIsAddingDailyTask] = useState<boolean>(false);
    const [userDailyTasks, setUserDailyTasks] = useState<DailyTask[] | null>(null);
    const [taskType, setTaskType] = useState<TaskType>('daily');
    const [recommendations, setRecommendations] = useState<RecommendationBlueprint[] | null>(null);

    const [changes, setChanges] = useState<DailyTask[] | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null)

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
            const { data } = await api.get('/v1/tasks/recommendations')
            setRecommendations(data)
        } catch (err) {
            console.error("error fetching recommendations: ", err)
        }
    }

    const handleRetrieveDailyTasks = async () => {
        if (!user) return;
        try{
            const idToken = await user.getIdToken();
            const { data } = await api.get<DailyTask[] | null>('/v1/tasks', {
                params: {},
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            })
            setUserDailyTasks(data)
            console.log("daily tasks: ", userDailyTasks)
        } catch (err){
            if (axios.isAxiosError(err)) {
                console.error("Error fetching daily tasks: ", err.response?.data || err.message);
                setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch shines.');
            } else {
                console.error("Unknown error:", err);
                setError('Could not load daily tasks.');               
            }
        }
    }

    const handleCreateDailyTask = async (dailyTaskData: DailyTask) => {
        if(!user) return;
        if(!dailyTaskData){
            console.log("No task provided.")
            return;
        } 
        try{
            const idToken = await user.getIdToken();
            const { data } = await api.post('/v1/tasks', dailyTaskData,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                }
            )
            setUserDailyTasks((prev) => {
                return prev ? [...prev, dailyTaskData] : [dailyTaskData]
            })
            console.log("data: ", data)
        } catch (err) {
            if(axios.isAxiosError(err)){
                console.error("Error creating daily task: ", err.response?.data || err.message)
                setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch shines.')
            } else {
                console.error("Unknown error: ", err)
                setError("Could not create daily task.")
            }
        }
    }

    useEffect(() => {
        handleRetrieveRecommendations();
        handleRetrieveDailyTasks();
    }, [])

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