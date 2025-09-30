import { useState } from "react";
import TaskBody from "./body/TaskBody";
import TaskHeader from "./header/TaskHeader";
import { DailyTask, TaskType } from "@/lib/firebase/interfaces";
import TaskBarFooter from "./body/footer/TaskBarFooter";

interface TaskContainerProps{
    taskType: TaskType;
    onSwitchTaskType: (taskType: TaskType) => void;
}
/**
 * Container for the task (main) column of My Tasks
 * @returns TaskHeader and TaskBody
 */
const TaskContainer = ({
    taskType, 
    onSwitchTaskType
}: TaskContainerProps) => {
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [changes, setChanges] = useState<DailyTask[] | null>(null);
    const [currentTasks, setCurrentTasks] = useState<DailyTask[] | null>(null);
    const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

    // handler for setting footer to be visible (MAY NOT NEED)
    const handleHasChanges = () => {
        try{
            setHasChanges(true);
        } catch (err) {
            console.error("error toggling changes: ", err);
        }
    }

    // handler for if starting to add task
    const handleToggleAddingTask = () => {
        try{
            setIsAddingTask(true)
        } catch (err) {
            console.error("error starting to add task: ", err)
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

            setIsAddingTask(false);

        } catch (err) {
            console.error(`error while adding new task, ${task.title}: `, err)
        }
    }

    // handler for saving additions/edits to task list
    const handleSaveChanges = (changes: DailyTask[]) => {
        try{
            if (!currentTasks) return;
            console.log("placeholder") //need to handle api call instead

            const updatedTasks: DailyTask[] = [...currentTasks, ...changes]

            setCurrentTasks(updatedTasks);
            setChanges(null)
            setHasChanges(false);
        } catch (err) {
            console.error(`error while saving ${taskType} task changes: ${err}`);
        }
    }

    const handleCancelChanges = (changes: DailyTask[]) => {
        try{
            setHasChanges(false)
        } catch (err) {
            console.error(`error while canceling ${taskType} task changes: ${err}`)
        }
    }


    return (
        <div className="flex flex-col w-full h-full p-[10px] bg-white rounded-[14px] gap-[10px] 
        border-[1px] border-gray-200 border-solid shadow-md">
            <TaskHeader 
                taskType={taskType}
                onSwitchType={onSwitchTaskType}
            />
            <TaskBody 
                taskType={taskType}
                onAddTask={handleAddTask} 
            />
            <TaskBarFooter
                hasChanges={hasChanges} 
                onSaveChanges={handleSaveChanges}
                onCancelChanges={handleCancelChanges}
            />
        </div>
    )
}

export default TaskContainer;