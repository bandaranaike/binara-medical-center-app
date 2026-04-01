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
                className={`flex h-4 w-4 items-center justify-center rounded-[0.35rem] border transition-all duration-100 ${
                    checked
                        ? "border-[var(--accent-strong)] bg-[var(--accent-strong)]"
                        : "border-[var(--border-strong)] bg-[var(--surface-muted)]"
                }`}
            >
                {checked && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
            </div>
        </div>
    );
};

export default CustomTableBulkCheckbox;
