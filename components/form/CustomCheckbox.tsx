import React from "react";

interface CustomCheckboxProps {
    label?: string; // Optional label for the checkbox
    setChecked: (checked: boolean) => void; // Optional callback when state changes
    checked: boolean
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({label, checked, setChecked}) => {

    const toggleChecked = () => {
        setChecked(!checked);
    };

    return (
        <div className="flex items-center cursor-pointer" onClick={toggleChecked}>
            <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                    checked ? "bg-blue-500" : "bg-gray-300"
                }`}
            >
                {checked && <div className="w-2 h-2 bg-white rounded"></div>}
            </div>
            {label && <span className="ml-2 text-sm">{label}</span>}
        </div>
    );
};

export default CustomCheckbox;
