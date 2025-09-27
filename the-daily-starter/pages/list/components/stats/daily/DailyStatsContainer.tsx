/**
 * Container for all of the daily stats (current streak, tasks completed, etc.)
 */

import CurrentStreak from "./CurrentStreak";
import TaskProgress from "./TaskProgress";

const DailyStatsContainer = () => {

    return(
        <div className="flex flex-col w-full h-[260px] bg-gray-200 rounded-[14px] p-[10px] gap-[12px]">
            <h1 className="font-semibold text-[24px]">
                Daily Stats
            </h1>
            <div className="flex flex-col gap-[8px]">
                <CurrentStreak streak={2}/>
                <TaskProgress completedTasks={5} totalTasks={8}/>
            </div>
        </div>
    )
};

export default DailyStatsContainer;