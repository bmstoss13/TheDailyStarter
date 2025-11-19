import { Category, CategoryType, DailyTask } from "@/lib/firebase/interfaces";
import { useState } from "react";
import TaskCategoryFilter from "./filters/TaskCategoryFilter";
import { handleCategoryColor } from "@/pages/api/taskColorHelper";

interface DailyTaskModalBodyProps{
    onAddDailyTask: (dailyTask: DailyTask) => void
}

const DailyTaskModalBody = () => {
    const [category, setCategory] = useState<Category | CategoryType | string | null>(null);
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const handleFilterCategory = (selectedCategory: Category | CategoryType | string | null) => {
        try{
            setCategory(selectedCategory);
        } catch (err) {
            console.error("error while changing category filter: ", err)
        }
    }

    return(
        <div className={`flex flex-col w-full p-[10px] gap-[10px]`}>
            <textarea 
                placeholder="What do you want to accomplish today?"
                className={`flex w-full h-[100px] p-[6px] rounded-[14px]
                    border-gray-200 border-solid border-[2px]
                    transition-all duration-[0.1s] ease
                    focus:border-[var(--primary)] focus:outline-none focus:ring-0
                    hover:border-[var(--primaryBg)]
                    `}
                style={{
                    'resize': 'none'
                }}
            >
            </textarea>
            <TaskCategoryFilter 
                onChangeCategory={handleFilterCategory}
                color={category !== null && category !== "" ? handleCategoryColor(category as CategoryType) : 'var(--iconColor)'}
            />
        </div>
    )
}

export default DailyTaskModalBody;
