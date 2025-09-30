import { Category, RecommendationBlueprint, TaskType } from "@/lib/firebase/interfaces"
import RecommendationList from "./RecommendationList";
import CategoryFilter from "./filters/CategoryFilter";
import { useState } from "react";
import { handleCategoryColor } from "@/pages/api/taskColorHelper";

interface RecommendationsBodyProps{
    recommendations: RecommendationBlueprint[] | null;
    taskType: TaskType;
}

const RecommendationsBody = ({
    recommendations,
    taskType,
}: RecommendationsBodyProps) => {
    const [category, setCategory] = useState<Category | null | string>(null);

    const handleFilterCategory = (selectedCategory: Category | null | string) => {
        try{
            setCategory(selectedCategory);
        } catch (err) {
            console.error("error while changing category filter: ", err)
        }
    }
    return(
        <div className="flex flex-col w-full h-full gap-[10px]">
            <CategoryFilter 
                onChangeCategory={handleFilterCategory}
                color={category !== null && category !== "" ? handleCategoryColor(category as Category) : 'var(--iconColor)'}
            />
            <RecommendationList 
                recommendations={recommendations}
                taskType={taskType}
                category={category}
            />
        </div>
    )
}

export default RecommendationsBody;

