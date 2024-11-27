import React from "react";

interface AddIconProps {
    size?: number; // Size of the icon (width and height)
    strokeColor?: string; // Color of the stroke
    className?: string; // Additional CSS classes
}

const AddIcon: React.FC<AddIconProps> = ({ size = 24, strokeColor = "currentColor", className = "" }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={strokeColor}
            className={`size-${size} ${className}`}
            width={size}
            height={size}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
};

export default AddIcon;
