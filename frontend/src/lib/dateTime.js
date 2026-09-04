export const getLocalDateString = (dateInput) => {
    const date = dateInput ? new Date(dateInput) : new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
};

export const formatDateToVN = (dateString) => {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${day}-${month}`;
};

export const generateDatesUpTo = (startDateStr, endDateStr) => {
    const dates = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (start <= end) {
        dates.push(start.toISOString().split('T')[0]);
        start.setDate(start.getDate() + 1);
    }

    return dates;
};

export const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';
