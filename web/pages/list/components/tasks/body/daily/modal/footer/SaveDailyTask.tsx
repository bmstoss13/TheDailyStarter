import { DailyTask } from "@/lib/firebase/interfaces";

interface SaveDailyTaskProps{
    onSaveChanges: (dailyTask: DailyTask) => void;
    canAdd: boolean;
    dailyTask: DailyTask;
}
/**
 * Component to handle changes, updating the user in db
 * @returns Save Changes Button
 */
const SaveDailyTask = ({
    canAdd, 
    onSaveChanges,
    dailyTask,
}: SaveDailyTaskProps) => {
    return(
        <button 
            className={`flex w-[80px] p-[6px] items-center justify-center 
            text-white text-wrap rounded-[14px] ml-auto`}
            style={{
                background: canAdd ? 'var(--primary)' : 'var(--iconColor)',
                cursor: canAdd ? "pointer" : "not-allowed" 
            }}
            aria-disabled={!canAdd}
            onClick={() => onSaveChanges(dailyTask)}
        >
            Add
        </button>
    )
};

export default SaveDailyTask;