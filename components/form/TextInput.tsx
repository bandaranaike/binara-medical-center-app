import React from "react";

interface BInputProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
}

const TextInput: React.FC<BInputProps> = ({ name, value, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        onChange(newValue); // Call the onChange prop with the new value
    };

    return (
        <div className="mb-4">
            <label>
                <span className="block mb-2">{name}:</span>
                <input
                    type="text"
                    className="bg-gray-800 w-full rounded border-gray-700 text-gray-300 dark:bg-gray-800 dark:text-gray-300"
                    value={value}
                    onChange={handleChange}
                    placeholder={name}
                />
            </label>
        </div>
    );
};

export default TextInput;
