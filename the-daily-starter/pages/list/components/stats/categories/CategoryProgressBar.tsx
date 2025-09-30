
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import ProgressBar from "../ProgressMeter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CategoryProgressBarProps{
    color: string;
    icon: IconDefinition;
    level: number;
    currentXP: number;
    levelUpXP: number;
}

/**
 * Take in color for category, display icon for category, level for category, and progress
 */

const CategoryProgressBar = ({
    color, 
    icon, 
    level, 
    currentXP, 
    levelUpXP
}: CategoryProgressBarProps) => {

    return(
        <div
            className="w-full flex flex-row items-center"
            style={{
                color: color            
            }}  
        >
            <div className="w-[40px]">
                <FontAwesomeIcon 
                    icon={icon}                     
                />
            </div>

            <p className="w-[60px] text-nowrap text-[14px] p-auto">
                LV {level}
            </p>
            <ProgressBar 
                completed={currentXP} 
                total={levelUpXP}
                color={color}
                height={'4px'}
            />

        </div>
    )
};

export default CategoryProgressBar;