// Daily Task item for mini list on feed page

import { DailyTask } from "@/lib/firebase/interfaces";

// Pass in daily task from Mini List Feed
interface MiniListDailyItemProps{
    dailyTask: DailyTask
}

const MiniListDailyTask = ({dailyTask}: MiniListDailyItemProps) => {
    return(
        <div>
            {dailyTask && (
                <div>
                    {dailyTask.title}
                </div>
            )}
        </div>
    )
}

export default MiniListDailyTask;