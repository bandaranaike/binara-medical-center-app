import React from "react";

interface CustomCheckboxProps {
    label?: string;
    setChecked: (checked: boolean) => void;
    checked: boolean;
    disabled?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({label, checked, setChecked, disabled = false}) => {
    return (
        <button
            type="button"
            className={`flex items-center text-left ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            onClick={() => {
                if (!disabled) {
                    setChecked(!checked);
                }
            }}
        >
            <span
                className="flex h-6 w-6 items-center justify-center rounded-[0.7rem] border transition-all duration-200"
                style={{
                    background: checked ? "var(--accent)" : "var(--surface-soft)",
                    borderColor: checked ? "var(--accent-strong)" : "var(--border-subtle)",
                }}
            >
                {checked && <span className="h-2.5 w-2.5 rounded-[0.3rem] bg-white"></span>}
            </span>
            {label && <span className="ml-3 text-sm" style={{color: "var(--foreground)"}}>{label}</span>}
        </button>
    );
};

export default CustomCheckbox;
