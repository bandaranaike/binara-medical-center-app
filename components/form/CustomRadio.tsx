import React from "react";

interface CustomRadioProps {
    label?: string;
    value: string;
    groupValue: string;
    size?: number;
    onChange: (value: string) => void;
}

const CustomRadio: React.FC<CustomRadioProps> = ({label, value, groupValue, onChange, size = 6}) => {
    const isSelected = value === groupValue;
    const outerSize = `w-${size} h-${size}`;
    const innerSize = `w-${size / 2} h-${size / 2}`;

    return (
        <button
            type="button"
            className="mr-4 flex items-center text-left transition hover:opacity-90"
            onClick={() => onChange(value)}
        >
            <span
                className={`${outerSize} flex items-center justify-center rounded-full border transition-all duration-200`}
                style={{
                    background: isSelected ? "var(--accent)" : "var(--surface-soft)",
                    borderColor: isSelected ? "var(--accent-strong)" : "var(--border-subtle)",
                }}
            >
                {isSelected && <span className={`${innerSize} rounded-full bg-white`}></span>}
            </span>
            {label && <span className="ml-2 text-sm" style={{color: "var(--foreground)"}}>{label}</span>}
        </button>
    );
};

export default CustomRadio;
