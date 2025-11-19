import { Category, CategoryType, Option } from "@/lib/firebase/interfaces";
import CustomSelect from "./CustomSelect";

interface CategoryFilterProps{
    onChangeCategory: (category: Category | CategoryType) => void;
    color: string;
}

const categoryOptions: Option[] = [

    { value: "", label: "All Categories" }, 
    { value: "Social", label: "Social" },
    { value: "Physical", label: "Physical" },
    { value: "Creativity", label: "Creativity" },
    { value: "Financial", label: "Financial" },
    { value: "Mental", label: "Mental" },
    { value: "Productivity", label: "Productivity" },
    { value: "Mindfulness", label: "Mindfulness" },
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