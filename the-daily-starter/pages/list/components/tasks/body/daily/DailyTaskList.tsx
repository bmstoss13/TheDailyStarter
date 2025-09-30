import { Category, DailyTask } from "@/lib/firebase/interfaces";
import DailyTaskItem from "./DailyTaskItem";
import AddDailyTask from "./AddDailyTask";
import { handleTaskColor } from "@/pages/api/taskColorHelper";

interface DailyTaskListProps{
    dailyTaskList: DailyTask[];
    onAddTask: (task: DailyTask) => void;
}

const DailyTaskList = ({dailyTaskList, onAddTask}: DailyTaskListProps) => {

    return (
        <div className='flex flex-col h-full w-full gap-[10px]'>
            {dailyTaskList.map((dailyTask) => {
                return(
                    <DailyTaskItem 
                        key={dailyTask.id} 
                        dailyTask={dailyTask}
                        color={handleTaskColor(dailyTask)}
                    />
                )
            })}
            <AddDailyTask onAddTask={onAddTask} />

        </div>
    )
};

export default DailyTaskList;