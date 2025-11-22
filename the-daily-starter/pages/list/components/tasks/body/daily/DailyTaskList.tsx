import { Category, DailyTask } from "@/lib/firebase/interfaces";
import DailyTaskItem from "./DailyTaskItem";
import AddDailyTask from "./AddDailyTask";
import { handleTaskColor } from "@/pages/api/taskColorHelper";

interface DailyTaskListProps{
    dailyTaskList: DailyTask[] | null;
    onAddTask: (task: DailyTask) => void;
    onToggleDailyTaskModal: () => void;
}

const DailyTaskList = ({
    dailyTaskList,
    onAddTask,
    onToggleDailyTaskModal
}: DailyTaskListProps) => {

    return (
        <div className='flex flex-col h-full w-full gap-[10px]'>
            {dailyTaskList && dailyTaskList.map((dailyTask) => {
                return(
                    <DailyTaskItem 
                        key={dailyTask.id} 
                        dailyTask={dailyTask}
                        color={handleTaskColor(dailyTask)}
                    />
                )
            })}
            <AddDailyTask 
                onAddTask={onAddTask}
                onToggleDailyTaskModal={onToggleDailyTaskModal} 
            />

        </div>
    )
};

export default DailyTaskList;