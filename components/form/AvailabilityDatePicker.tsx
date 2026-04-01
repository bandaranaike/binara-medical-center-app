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
                                `rounded-[0.6rem] text-center text-sm font-semibold leading-9 transition-colors
                                ${isDisabled
                                    ? 'cursor-not-allowed bg-[var(--surface-soft)] opacity-50' // Disabled state
                                    : isSelected
                                        ? 'cursor-pointer bg-[var(--accent-strong)] text-white' // Selected state
                                        : 'cursor-pointer bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)]' // Default selectable state
                                } 
                                ${!isCurrentMonthDay
                                    ? 'text-[var(--foreground-subtle)]' // Not the current month but selectable
                                    : 'text-[var(--foreground)]'} 
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
                className={`flex w-full min-w-72 gap-2 rounded-[0.7rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2.5 text-left text-sm text-[var(--foreground)] transition
                ${disabled ? 'cursor-not-allowed text-[var(--foreground-subtle)]' : 'hover:border-[var(--border-strong)]'}`}
                onClick={handleToggle}
            >
                <CalendarIcon width={20} className=""/> {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'Select date'}
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 min-w-max rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] pb-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                    <div className="p-4">
                        <div className="flex justify-between content-center items-center mt-2 mb-6">
                            <ArrowLeftIcon width={20} className="ml-2 cursor-pointer text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]" onClick={prevMonth}/>
                            <span className="mx-auto text-sm font-semibold text-[var(--foreground)]">{format(currentMonth, 'MMMM yyyy')}</span>
                            <ArrowRightIcon width={20} className="mr-2 cursor-pointer text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]" onClick={nextMonth}/>
                        </div>
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Sun</th>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Mon</th>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Tue</th>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Wed</th>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Thu</th>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Fri</th>
                                <th className="h-6 w-10 text-center text-sm font-medium leading-6 text-[var(--foreground-muted)]">Sat</th>
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
