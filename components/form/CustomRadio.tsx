import React from "react";

interface CustomRadioProps {
    label?: string; // Optional label for the radio button
    value: string; // Unique value for each radio button
    groupValue: string; // Current selected value in the group
    size?: number; // Current selected value in the group
    onChange: (value: string) => void; // Callback when selection changes
}

const CustomRadio: React.FC<CustomRadioProps> = ({label, value, groupValue, onChange, size = 6}) => {
    const isSelected = value === groupValue;
    const outerSize = `w-${size} h-${size}`;
    const innerSize = `w-${size / 2} h-${size / 2}`;

    const handleSelection = () => {
        onChange(value);
    };

    return (
        <div className="flex items-center cursor-pointer mr-4" onClick={handleSelection}>
            <div
                className={`${outerSize} rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected ? "bg-blue-500" : "bg-gray-300"
                }`}
            >
                {isSelected && <div className={`${innerSize} bg-white rounded-full`}></div>}
            </div>
            {label && <span className="ml-1 text-sm">{label}</span>}
        </div>
    );
};

export default CustomRadio;
