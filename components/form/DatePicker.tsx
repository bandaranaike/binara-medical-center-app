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
            background: "bg-gray-700 dark:bg-gray-800",
            input: "w-full rounded text-gray-300 dark:bg-gray-800 dark:text-gray-300 border-gray-500",
            icons: "",
            todayBtn: 'Today',
            clearBtn: "Clear", text: "", disabledText: "Disabled", inputIcon: "", selected: ""
        }
    };

    return (
        <div className="mb-4">
            <label className="block mb-2">
                <span className="block mb-2">{name}:</span>
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
