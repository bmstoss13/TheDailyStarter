import { Category, DailyTask } from "@/lib/firebase/interfaces";
import DailyTaskList from "./DailyTaskList";

interface DailyTaskContainerProps{
    tasks: DailyTask[] | null;
    onAddTask: (task: DailyTask) => void
    onToggleDailyTaskModal: () => void
}

const DailyTaskContainer = ({
    tasks,
    onAddTask,
    onToggleDailyTaskModal
}: DailyTaskContainerProps) => {
    return(
        <div className="flex flex-col w-full h-full items-center">
            <DailyTaskList 
                dailyTaskList={tasks}
                onAddTask={onAddTask}
                onToggleDailyTaskModal={onToggleDailyTaskModal}
            />
        </div>
    )
}

export default DailyTaskContainer;