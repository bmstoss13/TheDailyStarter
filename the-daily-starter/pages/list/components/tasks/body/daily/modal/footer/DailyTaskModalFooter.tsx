import { DailyTask } from "@/lib/firebase/interfaces";
import SaveDailyTask from "./SaveDailyTask";

interface DailyTaskModalFooterProps{
    onAddDailyTask: (dailyTask: DailyTask) => void;
}

const DailyTaskModalFooter = ({
    onAddDailyTask
}: DailyTaskModalFooterProps) => {
    return(
        <div className="flex w-full p-[10px] ">
            <SaveDailyTask 
                onSaveChanges={onAddDailyTask}
                canAdd={false}
            />
        </div>
    )
}

export default DailyTaskModalFooter;