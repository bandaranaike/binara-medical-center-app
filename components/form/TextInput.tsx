import React from "react";

interface BInputProps {
    name?: string;
    value?: string;
    type?: string;
    onChange: (value: any) => void;
    error?: string;
    required?: boolean;
}

const TextInput: React.FC<BInputProps> = ({name, value, onChange, type = "text", error, required}) => {
    return (
        <div>
            <label>
                {name && (
                    <span className="mb-2 block text-sm font-medium" style={{color: "var(--foreground)"}}>
                        {name} {required && <span className="text-red-500 text-sm -mt-2">*</span>}
                    </span>
                )}
                <input
                    type={type}
                    className="app-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={name}
                />
            </label>
            {error && <p className="mt-1 text-xs italic text-red-500">{error}</p>}
        </div>
    );
};

export default TextInput;
