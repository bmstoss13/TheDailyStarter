import { Category, CategoryType, RecommendationBlueprint, TaskType } from "@/lib/firebase/interfaces";
import RecommendationItem from "./RecommendationItem";
import { handleTaskColor } from "@/pages/api/taskColorHelper";

interface RecommendationListProps{
    recommendations: RecommendationBlueprint[] | null;
    taskType: TaskType;
    category: Category | CategoryType | null | string;
}

const RecommendationList = ({
    recommendations,
    taskType,
    category
}: RecommendationListProps) => {

    return (
        <div className="flex flex-col w-full flex-grow max-h-full gap-[10px] overflow-y-auto">
            {recommendations?.
                filter(rec => rec.taskType === taskType).
                filter(rec => {
                    if (category === null || category === "") {
                        return true;
                    }
                    return rec.category === category
                }).
                map((rec) => {
                    return(
                        <RecommendationItem 
                            key={rec.title}
                            rec={rec}
                            color={handleTaskColor(rec)}
                        />
                    )

                })
            }
        </div>
    )
}

export default RecommendationList;