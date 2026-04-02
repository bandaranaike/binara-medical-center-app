import React, {useState} from "react";
import {ChevronDownIcon} from "@nextui-org/shared-icons";

type Option = {
    label: string;
    value: string;
};

type CustomSelectProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
};

const CustomSelect: React.FC<CustomSelectProps> = ({options, value, onChange, className, placeholder}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedValue, setSelectedValue] = useState("");

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
    const selectedOption = options.find((option) => option.value === value);

    const setSelection = (nextValue: string) => {
        onChange(nextValue);
        setSelectedValue(nextValue);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div>
            {isOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>}
            <div className={`relative z-50 min-w-40 w-full ${className}`}>
                {placeholder && <label className="app-label">{placeholder}</label>}
                <button
                    type="button"
                    className="app-input relative flex w-full items-center justify-between pr-10 text-left"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="truncate">{selectedValue || (selectedOption ? selectedOption.label : "Select an option")}</span>
                    <ChevronDownIcon className="absolute right-3 top-3.5" />
                </button>
                {isOpen && (
                    <div className="absolute z-[60] mt-1 w-full rounded-[var(--radius-sm)] border p-1 shadow-lg" style={{background: "var(--surface-elevated)", borderColor: "var(--border-subtle)"}}>
                        {options.length > 10 && (
                            <input
                                type="text"
                                className="app-input mb-1 h-10"
                                placeholder="Search.."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        )}
                        <ul className="max-h-40 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        className="cursor-pointer rounded-[0.7rem] p-2 transition"
                                        style={{color: "var(--foreground)"}}
                                        onClick={() => setSelection(option.value)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "var(--surface-soft)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {option.label}
                                    </li>
                                ))
                            ) : (
                                <div className="p-2" style={{color: "var(--muted)"}}>No options found</div>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
