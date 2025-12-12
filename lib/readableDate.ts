export const formatReadableDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: '2-digit',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};
export const dateToYmdFormat = (date: string | null | Date) => {
    if (!date) return ""; // Handle null case by returning an empty string

    const selectedDate = date instanceof Date ? date : new Date(date);

    if (isNaN(selectedDate.getTime())) return ""; // Handle invalid dates

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
    const day = String(selectedDate.getDate()).padStart(2, "0"); // Ensure 2-digit day

    return `${year}-${month}-${day}`;
};
