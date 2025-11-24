import { DailyTask } from "@/lib/firebase/interfaces";

interface DailyTaskTitleProps{
    dailyTask: DailyTask
}

export default function DailyTaskTitle({
    dailyTask
}:DailyTaskTitleProps){
    return(
        <h1>
            {dailyTask.title}
        </h1>
    )
}