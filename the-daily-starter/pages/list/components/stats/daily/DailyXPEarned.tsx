
interface DailyXPEarnedProps{
    dailyXP: number;
}

/**
 * Display the total XP earned as of the day
 */

const DailyXPEarned = ({dailyXP}: DailyXPEarnedProps) => {

    return(
        <div  className="flex flex-col font-semibold gap-[8px]">
            <h1>
                XP Earned Today:
            </h1>
            <div className="flex">
                <p className="font-bold text-[36px] text-(--primary) m-auto">
                    {dailyXP}
                </p>
            </div>
        </div>
    )
}

export default DailyXPEarned;