
import ProgressBar from "../ProgressMeter";
import CurrentStreak from "./CurrentStreak";
import DailyXPEarned from "./DailyXPEarned";
import TaskProgress from "./TaskProgress";

/**
 * Container for all of the daily stats (current streak, tasks completed, etc.)
 */

const DailyStatsContainer = () => {

    const streak = 2;
    const completedTasks = 5;
    const totalTasks = 8;

    return(
        <div className="flex flex-col w-full h-[260px] bg-gray-200 rounded-[14px] p-[10px] gap-[16px]">
            <h1 className="font-semibold text-[24px]">
                Daily Stats
            </h1>
            <div className="flex flex-col gap-[12px]">
                <CurrentStreak streak={streak}/> {/** Display the streak of setups for the daily task list */}
                <TaskProgress 
                    completedTasks={completedTasks} 
                    totalTasks={totalTasks}
                />
                <ProgressBar 
                    completed={completedTasks} 
                    total={totalTasks} 
                    color="var(--primary)"
                    height="8px" 
                />
                <DailyXPEarned dailyXP={5} />
            </div>
        </div>
    )
};

export default DailyStatsContainer;