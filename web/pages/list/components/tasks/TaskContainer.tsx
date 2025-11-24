import { useState } from "react";
import TaskBody from "./body/TaskBody";
import TaskHeader from "./header/TaskHeader";
import { DailyTask, TaskType} from "@/lib/firebase/interfaces";

interface TaskContainerProps{
    tasks: DailyTask[] | null;
    taskType: TaskType;
    onSwitchTaskType: (taskType: TaskType) => void;
    onDeleteDailyTask: (taskId: string) => void;
    onToggleAddDailyTask: () => void;
}
/**
 * Container for the task (main) column of My Tasks
 * @returns TaskHeader and TaskBody
 */
const TaskContainer = ({
    tasks,
    taskType, 
    onSwitchTaskType,
    onToggleAddDailyTask,
    onDeleteDailyTask,
}: TaskContainerProps) => {
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [changes, setChanges] = useState<DailyTask[] | null>(null);
    const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

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

    return (
        <div className="flex flex-col w-full h-full p-[10px] bg-white rounded-[14px] gap-[10px] 
        border-[1px] border-gray-200 border-solid shadow-md">
            <TaskHeader 
                taskType={taskType}
                onSwitchType={onSwitchTaskType}
            />
            <TaskBody 
                tasks={tasks}
                taskType={taskType}
                onAddTask={handleAddTask} 
                onToggleDailyTaskModal={onToggleAddDailyTask}
                onDeleteDailyTask={onDeleteDailyTask}
            />
            {/* <TaskBarFooter
                hasChanges={hasChanges} 
                onSaveChanges={handleSaveChanges}
                onCancelChanges={handleCancelChanges}
            /> */}
        </div>
    )
}

export default TaskContainer;