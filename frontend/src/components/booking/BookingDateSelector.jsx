import { formatDateToVN } from '@/lib/dateTime';

const BookingDateSelector = ({ dateList, selectedDate, onSelectDate, timeslotCount }) => (
    <>
        <h3 className="text-base font-bold text-gray-800 mb-3">1. Chọn giờ khám</h3>
        <div className="flex items-center mb-6 w-full">
            <div className="flex w-full overflow-x-auto hide-scrollbar border-b border-gray-200">
                {dateList.map((dateStr) => {
                    const isActive = dateStr === selectedDate;
                    return (
                        <div
                            key={dateStr}
                            onClick={() => onSelectDate(dateStr)}
                            className={`min-w-[130px] flex flex-col items-center justify-center py-3 cursor-pointer transition-colors border-b-2
                            ${isActive ? 'border-blue-600 bg-blue-50 text-gray-900' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                {formatDateToVN(dateStr)}
                            </span>
                            {isActive && timeslotCount > 0 && (
                                <span className="text-xs text-green-600 font-medium mt-1">
                                    {timeslotCount} khung giờ
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </>
);

export default BookingDateSelector;
