import React, {useState} from "react";
import Datepicker from "tailwind-datepicker-react";
import {IOptions} from "tailwind-datepicker-react/types/Options";

interface BInputProps {
    name: string;
    value?: Date;
    onChange: (date: Date) => void;
    error?: string;
}

const DatePicker: React.FC<BInputProps> = ({name, value, onChange, error}) => {
    const [show, setShow] = useState<boolean>(false);

    const handleClose = (state: boolean) => {
        setShow(state);
    };

    const handleOnChange = (date: Date | null) => {
        if (date) {
            onChange(date);
        }
    };

    const theme: IOptions = {
        todayBtn: true,
        clearBtn: false,
        theme: {
            background: "rounded-[0.7rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-[0_18px_40px_rgba(15,23,42,0.14)]",
            input: "w-full rounded-[0.7rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] shadow-none transition focus:border-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]",
            icons: "",
            todayBtn: 'Today',
            clearBtn: "Clear", text: "", disabledText: "Disabled", inputIcon: "", selected: ""
        }
    };

    return (
        <div className="mb-4">
            <label className="block mb-2">
                <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">{name}:</span>
                <Datepicker
                    options={theme}
                    show={show}
                    setShow={handleClose}
                    onChange={handleOnChange}
                    value={value}
                />
            </label>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
        </div>
    );
};

export default DatePicker;
