import React, {useState} from "react";
import Datepicker from "tailwind-datepicker-react"
import theme from "tailwindcss/defaultTheme";

interface BInputProps {
    name: string;
    value?: Date;
    onChange: (date: Date) => void;
    error?: string;
}

const DatePicker: React.FC<BInputProps> = ({name, value, onChange, error}) => {
    const [startDate, setStartDate] = useState<Date | null>(value || null);
    const [show, setShow] = useState<boolean>(false)
    const handleChange = (selectedDate: Date) => {
        console.log(selectedDate)
    }
    const handleClose = (state: boolean) => {
        setShow(state)
    }

    const handleOnChange = (date: Date | null) => {
        setStartDate(date);
        console.log("Came here ", date)
        if (date) {
            console.log("Came inside ", date)
            onChange(date);
        }
    };

    return (
        <div className="mb-4">
            <label className="block mb-2">
                <span className="block mb-2">{name}:</span>
                <Datepicker
                    options={{theme: {background: "bg-gray-700 dark:bg-gray-800", input: "w-full rounded text-gray-300 dark:bg-gray-800 dark:text-gray-300 border-gray-500",}, todayBtn:false}}
                    show={show} setShow={handleClose}
                    onChange={handleOnChange}
                />
            </label>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
        </div>
    );
};

export default DatePicker;
