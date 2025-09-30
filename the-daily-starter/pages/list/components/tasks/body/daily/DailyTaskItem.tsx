import { DailyTask } from "@/lib/firebase/interfaces";

interface DailyTaskItemProps{
    dailyTask: DailyTask;
    color: string;
}

const DailyTaskItem = ({dailyTask, color}: DailyTaskItemProps) => {
    return(
        <div 
            className='flex flex-col w-full h-[80px] border-[2px] border-solid rounded-[14px] p-[10px]'
            style={{
                borderColor: color
            }}
        >
            {dailyTask.title}

        </div>
    )
}

export default DailyTaskItem;