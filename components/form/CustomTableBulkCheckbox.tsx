import React from "react";

interface CustomTableBulkCheckboxProps {
    setChecked: (checked: boolean) => void; // Optional callback when state changes
    checked: boolean
}

const CustomTableBulkCheckbox: React.FC<CustomTableBulkCheckboxProps> = ({checked, setChecked}) => {

    const toggleChecked = () => {
        setChecked(!checked);
    };

    return (
        <div className="flex items-center cursor-pointer" onClick={toggleChecked}>
            <div
                className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-100 ${
                    checked ? "bg-purple-700" : "bg-gray-500"
                }`}
            >
                {checked && <div className="w-1.5 h-1.5 bg-gray-200 rounded"></div>}
            </div>
        </div>
    );
};

export default CustomTableBulkCheckbox;
