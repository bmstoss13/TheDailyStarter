import { Category, CategoryType, Option } from "@/lib/firebase/interfaces";
import { useState, useEffect } from "react";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


interface CustomSelectProps {
    onChangeCategory: (category: Category | CategoryType) => void;
    options: Option[];
    color: string;  
}

const CustomSelect = ({
    onChangeCategory,
    options,
    color
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<Category | CategoryType | string>("");

    const selectedOption = options.find(opt => opt.value === selectedItem) || options[0];

    const handleSelect = (val: Category | CategoryType | string) => {
        if (typeof val === 'number') {
            onChangeCategory(val as Category);
        } else {
            onChangeCategory(val as CategoryType);
        }
        setSelectedItem(val);
        setIsOpen(false);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdownElement = document.getElementById('custom-select-trigger');
            if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const focusClasses = isOpen ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : '';

    return (
        <div className="relative w-full" id="custom-select-trigger">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    cursor-pointer flex items-center justify-between p-2 
                    border-solid border-[2px] rounded-[14px] w-full 
                    text-center font-medium transition duration-[0.1s] ease
                    hover:bg-gray-100 bg-white
                    ${focusClasses}
                `}
                style={{ borderColor: color }}
            >
                <span className="flex-grow text-center">{selectedOption.label}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <ul className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-100 overflow-y-auto">
                    {options.map((opt) => (
                        <li 
                            key={opt.value}
                            className={`
                                p-3 cursor-pointer text-sm
                                ${(opt.value === selectedItem || opt.value === selectedItem) ? 'bg-[var(--primaryBg)] text-[var(--primary)] font-semibold' : 'hover:bg-gray-100'}
                                transition duration-[0.1s] ease
                            `}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;