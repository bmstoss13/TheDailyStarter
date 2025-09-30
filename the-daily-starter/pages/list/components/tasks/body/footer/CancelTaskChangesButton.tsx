import { DailyTask } from "@/lib/firebase/interfaces"

interface CancelTaskChangesButtonProps{
    hasChanges: boolean
    onCancelChanges: (changes: DailyTask[]) => void;
}

const CancelTaskChangesButton = ({
    hasChanges, 
    onCancelChanges
}: CancelTaskChangesButtonProps) => {
    return(
        <button 
            className="flex flex-row items-center justify-center w-[80px] p-[8px] border-[1px]
            border-solid rounded-[14px]"
            style={{
                borderColor: hasChanges ? 'var(--primary)' : 'var(--iconColor)',
                color: hasChanges ? 'var(--primary)' : 'var(--iconColor)',
                cursor: hasChanges ? "pointer" : "not-allowed"
            }}
            aria-disabled={!hasChanges}
            onClick={() => onCancelChanges}
        >
            Cancel
        </button>
    )
}

export default CancelTaskChangesButton;