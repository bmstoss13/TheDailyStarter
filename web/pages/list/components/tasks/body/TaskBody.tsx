import { DailyQuote, DailyTask, ScheduleType, TaskType } from "@/lib/firebase/interfaces";
import DailyTaskContainer from "./daily/DailyTaskContainer";
import Schedule from "./schedule/Schedule";
import BucketListContainer from "./bucket/BucketListContainer";
import { useState } from "react";

interface TaskBodyProps{
    tasks: DailyTask[] | null;
    taskType: TaskType;
    onAddTask: (task: DailyTask) => void;
    onToggleDailyTaskModal: () => void;
}

const TaskBody = ({
    tasks,
    taskType,
    onAddTask,
    onToggleDailyTaskModal
}: TaskBodyProps) => {
    return(
        <div className="flex flex-col w-full h-full
        p-[10px] border-[2px] border-solid border-gray-200 rounded-[14px]">
            {taskType === 'daily' && (
                <DailyTaskContainer 
                    tasks={tasks}
                    onAddTask={onAddTask}
                    onToggleDailyTaskModal={onToggleDailyTaskModal}
                />
            )}
            {taskType === 'schedule' && (
                <Schedule/>
            )}
            {taskType === 'bucket' && (
                <BucketListContainer />
            )}

        </div>
    )
}

export default TaskBody;