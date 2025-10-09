import { Category, DailyTask } from "@/lib/firebase/interfaces";
import DailyTaskList from "./DailyTaskList";


export const taskList: DailyTask[] = [
    {
        id: '123',
        title: 'Do the dishes',
        category: Category.Productivity,
        isComplete: false,
        points: 3,
        isDaily: false,
        createdAt: new Date()
        
    },
    {
        id: '1245',
        title: 'Make music for 1 hour',
        category: Category.Creativity,
        isComplete: false,
        points: 5,
        isDaily: true,
        createdAt: new Date()       
    },
    {
        id: '1254',
        title: 'Lift weights for 30 minutes',
        category: Category.Physical,
        isComplete: true,
        points: 3,
        isDaily: true,
        createdAt: new Date()       
    }
]

interface DailyTaskContainerProps{
    onAddTask: (task: DailyTask) => void
    onToggleDailyTaskModal: () => void
}

const DailyTaskContainer = ({
    onAddTask,
    onToggleDailyTaskModal
}: DailyTaskContainerProps) => {
    return(
        <div className="flex flex-col w-full h-full items-center">
            <DailyTaskList 
                dailyTaskList={taskList}
                onAddTask={onAddTask}
                onToggleDailyTaskModal={onToggleDailyTaskModal}
            />
        </div>
    )
}

export default DailyTaskContainer;