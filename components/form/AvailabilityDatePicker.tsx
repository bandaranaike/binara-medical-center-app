import React, {useState, useRef, useEffect} from 'react';
import {format, isSameDay, startOfMonth, endOfMonth, addDays, isSameMonth, parseISO, subMonths, addMonths} from 'date-fns';
import {ArrowLeftIcon} from "@heroicons/react/24/solid";
import {ArrowRightIcon, CalendarIcon} from "@heroicons/react/24/outline";

interface DatePickerProps {
    selectedDate?: Date | null | string; // Accepts Date object, null, or ISO date string
    onDateChange?: (date: Date | null | string) => void;
    availableDates?: string[]; // Array of ISO date strings
    disabled?: boolean; // Array of ISO date strings
    hasDoctorLock?: boolean;
}

const AvailabilityDatePicker: React.FC<DatePickerProps> = ({selectedDate, onDateChange, availableDates = [], disabled = false, hasDoctorLock = false}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date()));
    const datePickerRef = useRef<HTMLDivElement>(null);

    const availableDatesParsed = availableDates.map(dateString => parseISO(dateString));

    const isDateAvailable = (date: Date) => {
        return availableDatesParsed.some(availableDate => isSameDay(date, availableDate));
    };

    const handleDateClick = (date: Date) => {
        if ((hasDoctorLock && isDateAvailable(date)) || !hasDoctorLock) {
            if (onDateChange) onDateChange(format(date, 'yyyy-MM-dd'));
            setIsOpen(false);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const renderDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = addDays(monthStart, -monthStart.getDay());
        const endDate = addDays(monthEnd, 6 - monthEnd.getDay());

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonthDay = isSameMonth(day, currentMonth);
                const isDisabled = hasDoctorLock && !isDateAvailable(day);

                days.push(
                    <td
                        key={day.toISOString()}
                        className="p-px"
                    >
                        <div
                            className={
                                `text-center text-sm font-semibold leading-9 transition-colors rounded bg-gray-50 dark:bg-gray-700 dark:bg-opacity-30
                                ${isDisabled
                                    ? 'cursor-not-allowed' // Disabled state
                                    : isSelected
                                        ? 'bg-purple-700 text-white cursor-pointer dark:bg-purple-700 dark:bg-opacity-90 dark:text-white dark:hover:bg-opacity-100' // Selected state
                                        : 'cursor-pointer bg-purple-100 hover:bg-purple-200 dark:bg-purple-500 dark:bg-opacity-20 dark:hover:bg-opacity-40' // Default selectable state
                                } 
                                ${!isCurrentMonthDay
                                    ? 'text-gray-400 dark:text-gray-500' // Not the current month but selectable
                                    : 'text-gray-600  dark:text-gray-400'} 
                                `}
                            onClick={() => !isDisabled && handleDateClick(cloneDay)}> {format(day, 'd')}</div>
                    </td>
                );
                day = addDays(day, 1);
            }
            rows.push(<tr key={day.toISOString()}>{days}</tr>);
            days = [];
        }

        return rows;
    };

    return (
        <div ref={datePickerRef} className="relative">
            <button
                disabled={disabled}
                type="button"
                className={`min-w-72 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg py-2.5 px-3 w-full text-left flex gap-2 
                ${disabled ? 'cursor-not-allowed dark:text-gray-500 text-gray-300' : ''}`}
                onClick={handleToggle}
            >
                <CalendarIcon width={20} className=""/> {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'Select date'}
            </button>
            {isOpen && (
                <div className="absolute z-10 bg-white dark:bg-gray-800 dark:border-gray-700 border rounded-xl min-w-max shadow-lg mt-1 pb-2">
                    <div className="p-4">
                        <div className="flex justify-between content-center items-center mt-2 mb-6">
                            <ArrowLeftIcon width={20} className="ml-2 cursor-pointer dark:text-gray-400" onClick={prevMonth}/>
                            <span className="dark:text-gray-400 font-semibold text-sm mx-auto">{format(currentMonth, 'MMMM yyyy')}</span>
                            <ArrowRightIcon width={20} className="mr-2 cursor-pointer dark:text-gray-400" onClick={nextMonth}/>
                        </div>
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Sun</th>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Mon</th>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Tue</th>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Wed</th>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Thu</th>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Fri</th>
                                <th className="h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 w-10">Sat</th>
                            </tr>
                            </thead>
                            <tbody>{renderDays()}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityDatePicker;