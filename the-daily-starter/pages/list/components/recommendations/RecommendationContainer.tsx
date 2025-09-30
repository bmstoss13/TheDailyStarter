import { RecommendationBlueprint, TaskType } from "@/lib/firebase/interfaces";
import RecHeader from "./header/RecHeader";
import RecommendationsBody from "./body/RecommendationsBody";

interface RecommendationContainerProps{
    taskType: TaskType;
    recommendations: RecommendationBlueprint[] | null;
    onSwitchTaskType: (taskType: TaskType) => void;
}

const RecommendationContainer = ({taskType, onSwitchTaskType, recommendations}: RecommendationContainerProps) => {
    return (
        <div className="container flex flex-col w-full h-full p-[10px] bg-white rounded-[14px] gap-[12px] 
        border-[1px] border-gray-200 border-solid shadow-md items-center">
            <RecHeader />
            <RecommendationsBody 
                taskType={taskType} 
                recommendations={recommendations}
            />
        </div>
    )
}

export default RecommendationContainer;