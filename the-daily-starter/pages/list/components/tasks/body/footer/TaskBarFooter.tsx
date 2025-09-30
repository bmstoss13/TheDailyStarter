import { DailyTask } from "@/lib/firebase/interfaces";
import SaveTaskChangesButton from "./SaveTaskChangesButton";
import CancelTaskChangesButton from "./CancelTaskChangesButton";

interface TaskBarFooter{
    hasChanges: boolean
    onSaveChanges: (changes: DailyTask[]) => void;
    onCancelChanges: (changes: DailyTask[]) => void;
}

const TaskBarFooter = ({hasChanges, onSaveChanges, onCancelChanges}: TaskBarFooter) => {

    return(
        <div className="flex flex-row w-full items-center justify-end gap-[10px]">
            <CancelTaskChangesButton 
                hasChanges={hasChanges}
                onCancelChanges={onCancelChanges}
            />
            <SaveTaskChangesButton 
                hasChanges={hasChanges}
                onSaveChanges={onSaveChanges}
            />
        </div>
    )
}

export default TaskBarFooter;