import { DailyTask } from "@/lib/firebase/interfaces";

interface AddDailyTaskProps{
    onAddTask: (task: DailyTask) => void;
    onToggleDailyTaskModal: () => void;
}

const AddDailyTask = ({
    onAddTask,
    onToggleDailyTaskModal
}: AddDailyTaskProps) => {
    return (
        <button
            className='flex flex-col w-full h-[100px] border-[2px] border-dashed border-gray-200 rounded-xl 
            p-[10px] items-center justify-center text-gray-400 cursor-pointer 
            hover:border-(--primary) hover:text-(--primary) hover:scale-[1.015] hover:shadow-md 
            hover:shadow-(color:--primary) hover:bg-(--primaryBg)
            transition-all duration-[0.1s] ease'
            onClick={onToggleDailyTaskModal}
        >
            + Add New Task
        </button>
    )
}

export default AddDailyTask;