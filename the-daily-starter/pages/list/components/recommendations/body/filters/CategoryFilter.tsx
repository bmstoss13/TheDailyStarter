import { Category, Option } from "@/lib/firebase/interfaces";
import CustomSelect from "./CustomSelect";

interface CategoryFilterProps{
    onChangeCategory: (category: Category | string) => void;
    color: string;
}

const categoryOptions: Option[] = [

    { value: "", label: "All Categories" }, 
    { value: Category.Social, label: "Social" },
    { value: Category.Physical, label: "Physical" },
    { value: Category.Creativity, label: "Creativity" },
    { value: Category.Financial, label: "Financial" },
    { value: Category.Mental, label: "Mental" },
    { value: Category.Productivity, label: "Productivity" },
    { value: Category.Mindfulness, label: "Mindfulness" },
];

const CategoryFilter = ({
    onChangeCategory,
    color
}: CategoryFilterProps) => {

    return(
        <CustomSelect 
            onChangeCategory={onChangeCategory}
            options={categoryOptions}
            color={color}
        />
    )
};

export default CategoryFilter;