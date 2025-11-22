import { DailyTask } from "@/lib/firebase/interfaces";
import SaveDailyTask from "./SaveDailyTask";

interface DailyTaskModalFooterProps{
    onAddDailyTask: (dailyTask: DailyTask) => void;
    dailyTask: DailyTask;
}

const DailyTaskModalFooter = ({
    onAddDailyTask,
    dailyTask
}: DailyTaskModalFooterProps) => {
    return(
        <div className="flex w-full p-[10px] ">
            <SaveDailyTask 
                onSaveChanges={onAddDailyTask}
                canAdd={true}
                dailyTask={dailyTask}
            />
        </div>
    )
}

export default DailyTaskModalFooter;