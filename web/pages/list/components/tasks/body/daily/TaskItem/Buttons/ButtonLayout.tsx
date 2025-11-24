import { DailyTask } from "@/lib/firebase/interfaces";
import DeleteTaskButton from "./DeleteTaskButton";

interface ButtonLayoutProps{
    dailyTask: DailyTask;
    onDeleteDailyTask: (taskId: string) => void;
}

export default function ButtonLayout({
    dailyTask,
    onDeleteDailyTask,
}:ButtonLayoutProps){
    return(
        <div
            className={`flex ml-auto gap-4`}
        >
            <DeleteTaskButton 
                taskId={dailyTask.id}
                onDeleteDailyTask={onDeleteDailyTask}
            />
        </div>
    )
}