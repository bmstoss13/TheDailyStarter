
import { 
    faDumbbell, //physical icon
    faUserGroup, //social icon
    faPaintBrush, //creativity icon
    faDollarSign, //financial icon
    faBrain, //mental icon
    faBriefcase, //productivity icon
    faEye,
} from "@fortawesome/free-solid-svg-icons";
import CategoryProgressBar from "./CategoryProgressBar";

//Placeholder for social progress
const socialLevel = 2;
const currentSocialXP = 5;
const totalSocialXP = 10;

//Placeholder for physical progress
const physicalLevel = 3;
const currentPhysicalXP = 5;
const totalPhysicalXP = 20;

//Placeholder for creativity progress
const CreativityLevel = 1;
const currentCreativityXP = 0;
const totalCreativityXP = 5;

//Placeholder for mental progress
const mentalLevel = 2;
const currentMentalXP = 6;
const totalMentalXP = 10;

//Placeholder for productivity progress
const productivityLevel = 4;
const currentProductivityXP = 17;
const totalProductivityXP = 50;

//Placeholder for mindfulness progress



/**
 * Displays each category and the progress of each, including icon, level, and xp bar
 */
const CategoryProgressContainer = () => {
    return (
        <div className="flex flex-col h-[208px] gap-[5px]">

            {/** Social Category */}
            <CategoryProgressBar 
                color={'var(--social)'}
                icon={faUserGroup}
                level={socialLevel}
                currentXP={currentSocialXP}
                levelUpXP={totalSocialXP}
            />

            {/** Physical Category */}
            <CategoryProgressBar 
                color={'var(--physical)'}
                icon={faDumbbell}
                level={physicalLevel}
                currentXP={currentPhysicalXP}
                levelUpXP={totalPhysicalXP}
            />

            {/** Creativity Category */}
            <CategoryProgressBar 
                color={'var(--creativity)'}
                icon={faPaintBrush}
                level={CreativityLevel}
                currentXP={currentCreativityXP}
                levelUpXP={totalCreativityXP}
            />

            {/** Financial Category */}
            <CategoryProgressBar 
                color={'var(--financial)'}
                icon={faDollarSign}
                level={physicalLevel}
                currentXP={currentPhysicalXP}
                levelUpXP={totalPhysicalXP}
            />

            {/** Mental Category */}
            <CategoryProgressBar 
                color={'var(--mental)'}
                icon={faBrain}
                level={mentalLevel}
                currentXP={currentMentalXP}
                levelUpXP={totalMentalXP}
            />

            {/** Productivity Category */}
            <CategoryProgressBar 
                color={'var(--productivity)'}
                icon={faBriefcase}
                level={productivityLevel}
                currentXP={currentProductivityXP}
                levelUpXP={totalProductivityXP}
            />

            {/** Mindfulness Category */}
            <CategoryProgressBar 
                color={'var(--mindfulness)'}
                icon={faEye}
                level={physicalLevel}
                currentXP={currentPhysicalXP}
                levelUpXP={totalPhysicalXP}
            />
        </div>
    )
};

export default CategoryProgressContainer;