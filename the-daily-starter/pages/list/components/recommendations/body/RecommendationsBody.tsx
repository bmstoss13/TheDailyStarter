import { Category, CategoryType, RecommendationBlueprint, TaskType } from "@/lib/firebase/interfaces"
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
    const [category, setCategory] = useState<Category | CategoryType | null>(null);

    const handleFilterCategory = (selectedCategory: Category | CategoryType | null) => {
        try{
            setCategory(selectedCategory);
        } catch (err) {
            console.error("error while changing category filter: ", err)
        }
    }
    return(
        <div className="flex flex-col h-full w-full max-h-[80vh] gap-[10px]">
            <CategoryFilter 
                onChangeCategory={handleFilterCategory}
                color={category !== null? handleCategoryColor(category as CategoryType) : 'var(--iconColor)'}
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

