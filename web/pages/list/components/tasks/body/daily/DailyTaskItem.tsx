import { DailyTask } from "@/lib/firebase/interfaces";

interface DailyTaskItemProps{
    dailyTask: DailyTask;
    color: string;
}

const DailyTaskItem = ({dailyTask, color}: DailyTaskItemProps) => {
    return(
        <div 
            className={`flex flex-col w-full h-[100px] border-[2px] border-solid rounded-xl p-[10px]
                shadow-md`}
            style={{
                borderColor: color
            }}
        >
            {dailyTask.title}

        </div>
    )
}

export default DailyTaskItem;