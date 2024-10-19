import React from "react";

interface BInputProps {
    name: string;
    value?: string;
    type?: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

const TextInput: React.FC<BInputProps> = ({name, value, onChange, type = 'text', error, required}) => {
    return (
        <div className="mb-2">
            <label>
                <span className="block mb-2">{name} {required?<span className="text-red-500 text-sm -mt-2">*</span>:''} :</span>
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
