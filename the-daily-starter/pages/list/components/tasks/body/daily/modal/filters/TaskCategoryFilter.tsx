import { Category, CategoryType, Option } from "@/lib/firebase/interfaces";
import TaskCategorySelect from "./TaskCategorySelect";

interface TaskCategoryFilterProps{
    onChangeCategory: (category: Category | CategoryType | null) => void;
    color: string;
}

const categoryOptions: Option[] = [

    { value: "", label: "Select Category" }, 
    { value: "Social" as CategoryType, label: "Social" },
    { value: "Physical" as CategoryType, label: "Physical" },
    { value: "Creativity" as CategoryType, label: "Creativity" },
    { value: "Financial" as CategoryType, label: "Financial" },
    { value: "Mental" as CategoryType, label: "Mental" },
    { value: "Productivity" as CategoryType, label: "Productivity" },
    { value: "Mindfulness" as CategoryType, label: "Mindfulness" },
];

const TaskCategoryFilter = ({
    onChangeCategory,
    color
}: TaskCategoryFilterProps) => {

    return(
        <TaskCategorySelect
            onChangeCategory={onChangeCategory}
            options={categoryOptions}
            color={color}
        />
    )
};

export default TaskCategoryFilter;