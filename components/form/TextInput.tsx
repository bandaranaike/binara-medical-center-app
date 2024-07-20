import React from "react";

interface BInputProps {
    name: string;
    value?: string;
    type?: string;
    onChange: (value: string) => void;
    error?: string;
}

const TextInput: React.FC<BInputProps> = ({name, value, onChange, type = 'text', error}) => {
    return (
        <div className="mb-4">
            <label>
                <span className="block mb-2">{name}:</span>
                <input
                    type={type}
                    className="bg-gray-800 w-full rounded border-gray-700 text-gray-300 dark:bg-gray-800 dark:text-gray-300"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={name}
                />
            </label>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
        </div>
    );
};

export default TextInput;
