import { Category, Option } from "@/lib/firebase/interfaces";
import TaskCategorySelect from "./TaskCategorySelect";

interface TaskCategoryFilterProps{
    onChangeCategory: (category: Category | string) => void;
    color: string;
}

const categoryOptions: Option[] = [

    // { value: "", label: "Select Category" }, 
    { value: Category.Social, label: "Social" },
    { value: Category.Physical, label: "Physical" },
    { value: Category.Creativity, label: "Creativity" },
    { value: Category.Financial, label: "Financial" },
    { value: Category.Mental, label: "Mental" },
    { value: Category.Productivity, label: "Productivity" },
    { value: Category.Mindfulness, label: "Mindfulness" },
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