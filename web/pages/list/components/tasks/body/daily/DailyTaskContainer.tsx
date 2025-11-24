import { Category, DailyTask } from "@/lib/firebase/interfaces";
import DailyTaskList from "./DailyTaskList";

interface DailyTaskContainerProps{
    tasks: DailyTask[] | null;
    onAddTask: (task: DailyTask) => void
    onToggleDailyTaskModal: () => void
    onDeleteDailyTask: (taskId: string) => void
}

const DailyTaskContainer = ({
    tasks,
    onAddTask,
    onToggleDailyTaskModal,
    onDeleteDailyTask
}: DailyTaskContainerProps) => {
    return(
        <div className="flex flex-col w-full h-full items-center">
            <DailyTaskList 
                dailyTaskList={tasks}
                onAddTask={onAddTask}
                onToggleDailyTaskModal={onToggleDailyTaskModal}
                onDeleteDailyTask={onDeleteDailyTask}
            />
        </div>
    )
}

export default DailyTaskContainer;