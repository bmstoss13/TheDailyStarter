import CategoryProgressContainer from "./categories/CategoryProgressContainer";
import DailyStatsContainer from "./daily/DailyStatsContainer";
import LevelHeader from "./levels/LevelHeader";

/**
 * Stat bar on the left hand side of expanded list page
 * display user level header, today's stats, and category progress
 *  */ 
const StatBar = () => {
    return(
        <div className="container flex flex-col w-full h-full p-[10px] bg-white rounded-[14px] gap-[12px] 
        border-[1px] border-gray-200 border-solid shadow-md">
            <LevelHeader />
            <DailyStatsContainer />
            <CategoryProgressContainer />
        </div>
    )
};

export default StatBar;