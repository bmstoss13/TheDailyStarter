import { Category, RecommendationBlueprint, TaskType } from "@/lib/firebase/interfaces";
import RecommendationItem from "./RecommendationItem";
import { handleTaskColor } from "@/pages/api/taskColorHelper";

interface RecommendationListProps{
    recommendations: RecommendationBlueprint[] | null;
    taskType: TaskType;
    category: Category | null | string;
}

const RecommendationList = ({
    recommendations,
    taskType,
    category
}: RecommendationListProps) => {

    return (
        <div className="flex flex-col w-full h-full gap-[10px]">
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