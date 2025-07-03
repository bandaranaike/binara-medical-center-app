import React from "react";

interface CustomCheckboxProps {
    label?: string; // Optional label for the checkbox
    setChecked: (checked: boolean) => void; // Callback when state changes
    checked: boolean; // Current checked state
    disabled?: boolean; // Optional disabled state
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, setChecked, disabled = false }) => {

    const toggleChecked = () => {
        if (disabled) return;
        setChecked(!checked);
    };

    return (
        <div
            className={`flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            onClick={toggleChecked}
        >
            <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                    disabled
                        ? "bg-gray-200"
                        : checked
                            ? "bg-blue-500"
                            : "bg-gray-300"
                }`}
            >
                {checked && <div className="w-2 h-2 bg-white rounded"></div>}
            </div>
            {label && <span className="ml-2 text-sm text-gray-200">{label}</span>}
        </div>
    );
};

export default CustomCheckbox;
