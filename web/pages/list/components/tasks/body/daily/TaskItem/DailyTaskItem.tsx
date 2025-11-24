import { DailyTask } from "@/lib/firebase/interfaces";
import ButtonLayout from "./Buttons/ButtonLayout";
import DailyTaskTitle from "./Title/DailyTaskTitle";

interface DailyTaskItemProps{
    dailyTask: DailyTask;
    color: string;
    onDeleteDailyTask: (taskId: string) => void
}

const DailyTaskItem = ({
    dailyTask, 
    color,
    onDeleteDailyTask,
}: DailyTaskItemProps) => {
    return(
        <div 
            className={`flex flex-col w-full h-[100px] border-[2px] border-solid rounded-xl p-[10px]
                shadow-md hover:cursor-pointer`}
            style={{
                borderColor: color
            }}
        >
            <div
                className={`flex`}
            >
                <DailyTaskTitle dailyTask={dailyTask}/>
                <ButtonLayout 
                    dailyTask={dailyTask}
                    onDeleteDailyTask={onDeleteDailyTask}
                />
            </div>
        </div>
    )
}

export default DailyTaskItem;