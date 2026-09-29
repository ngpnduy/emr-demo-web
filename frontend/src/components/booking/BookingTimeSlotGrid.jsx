import { formatTime } from '@/lib/dateTime';

const BookingTimeSlotGrid = ({ isLoading, timeslots, selectedSlot, onSelectSlot }) => (
    <div className="min-h-[100px] mb-8">
        {isLoading ? (
            <div className="text-center text-gray-500 py-8">Đang tải giờ trống...</div>
        ) : timeslots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {timeslots.map((slot, index) => {
                    const isSelected = selectedSlot?.SLOT_NO === slot.SLOT_NO && selectedSlot?.SCHEDULE_ID === slot.SCHEDULE_ID;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelectSlot(slot)}
                            className={`py-2 px-3 rounded-md border transition-all flex flex-col items-center justify-center
                            ${isSelected
                                ? 'bg-[#2b5cc4] text-white border-[#2b5cc4] shadow-md'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-[#2b5cc4] hover:text-[#2b5cc4]'
                            }`}
                        >
                            <span className="text-sm font-semibold">
                                {formatTime(slot.Start_Time)} - {formatTime(slot.End_Time)}
                            </span>
                            <span className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                Đã đặt: {slot.Current_Count}/{slot.MAX_PATIENT_PER_SLOT}
                            </span>
                        </button>
                    );
                })}
            </div>
        ) : (
            <div className="text-center text-gray-500 py-8">Không có giờ trống trong ngày này.</div>
        )}
    </div>
);

export default BookingTimeSlotGrid;
