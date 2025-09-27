/**
 * Experience bar for current level of user
 */

interface ExperienceBarProps{
    currentXP: number;
    levelUpXP: number;
}

const ExperienceBar = ({currentXP, levelUpXP}: ExperienceBarProps) => {
    return(
        <div className="w-full h-[8px] bg-gray-400 rounded-[8px]">
        </div>
    )
};

export default ExperienceBar;