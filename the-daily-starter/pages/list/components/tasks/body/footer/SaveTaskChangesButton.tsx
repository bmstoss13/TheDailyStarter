import { DailyTask } from "@/lib/firebase/interfaces";

interface SaveTaskChangesButtonProps{
    onSaveChanges: (changes: DailyTask[]) => void;
    hasChanges: boolean;
}
/**
 * Component to handle changes, updating the user in db
 * @returns Save Changes Button
 */
const SaveTaskChangesButton = ({
    hasChanges, 
    onSaveChanges,
}: SaveTaskChangesButtonProps) => {
    return(
        <button 
            className="flex w-[80px] p-[6px] items-center justify-center 
            text-white text-wrap rounded-[14px]"
            style={{
                background: hasChanges ? 'var(--primary)' : 'var(--iconColor)',
                cursor: hasChanges ? "pointer" : "not-allowed" 
            }}
            aria-disabled={!hasChanges}
            onClick={hasChanges ? () => onSaveChanges : undefined}
        >
            Save
        </button>
    )
};

export default SaveTaskChangesButton;