import { DailyQuote, DailyTask, TaskType } from "@/lib/firebase/interfaces";
import DailyTaskContainer from "./daily/DailyTaskContainer";
import ScheduleContainer from "./schedule/ScheduleContainer";
import BucketListContainer from "./bucket/BucketListContainer";

interface TaskBodyProps{
    taskType: TaskType;
    onAddTask: (task: DailyTask) => void;
}

const TaskBody = ({
    taskType,
    onAddTask
}: TaskBodyProps) => {
    return(
        <div className="flex flex-col w-full h-full
        p-[10px] border-[2px] border-solid border-gray-200 rounded-[14px]">
            {taskType === 'daily' && (
                <DailyTaskContainer onAddTask={onAddTask}/>
            )}
            {taskType === 'schedule' && (
                <ScheduleContainer />
            )}
            {taskType === 'bucket' && (
                <BucketListContainer />
            )}

        </div>
    )
}

export default TaskBody;