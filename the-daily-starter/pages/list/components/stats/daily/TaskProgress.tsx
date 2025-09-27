
interface TaskProgressProps{
    totalTasks: number;
    completedTasks: number;
}

/**
 * Display progress tracker for users
 * Updates when item is added, completed, deleted, etc.
 */

const TaskProgress = ({totalTasks, completedTasks}: TaskProgressProps) => {

    return (
            <span className="flex flex-row font-semibold items-center">
                <h2>
                    Task Progress:
                </h2>

                <div
                    className="text-(--primary) ml-auto"
                >
                </div>

            </span>
    )
};

export default TaskProgress;