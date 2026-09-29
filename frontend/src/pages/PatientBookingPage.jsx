import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BookingDateSelector from '@/components/booking/BookingDateSelector';
import BookingDetailsSelector from '@/components/booking/BookingDetailsSelector';
import BookingTimeSlotGrid from '@/components/booking/BookingTimeSlotGrid';
import { PROFILES, SERVICES, SPECIALTIES } from '@/lib/bookingData';
import { generateDatesUpTo, getLocalDateString } from '@/lib/dateTime';
import api from '@/lib/axios';

const PatientBookingPage = () => {
    const facilityId = 'MF002';
    const branchId = 'BR002';
    const todayStr = getLocalDateString();
    const maxDateStr = '2026-05-15';

    const [dateList] = useState(generateDatesUpTo(todayStr, maxDateStr));
    const [selectedProfile, setSelectedProfile] = useState(PROFILES[0]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTIES[0]);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [timeslots, setTimeslots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAvailableSlots = async (date) => {
        setIsLoading(true);
        setTimeslots([]);
        setSelectedSlot(null);

        try {
            const response = await api.get('/query/timeslots', {
                params: { facilityId, branchId, date }
            });
            if (response.data.success) setTimeslots(response.data.data);
        } catch (error) {
            console.error('[FE] Lỗi khi tải danh sách giờ trống', error);
            toast.error('[FE] Không thể tải danh sách giờ trống.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Slot loading is an intentional external data synchronization on date changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAvailableSlots(selectedDate);
    }, [selectedDate]);

    const handleBookAppointment = async () => {
        if (!selectedSlot) {
            toast.error('[FE] Vui lòng chọn một khung giờ để đặt khám!');
            return;
        }

        const payload = {
            appointment_id: `APP_${Math.floor(Math.random() * 10000)}`,
            time: selectedSlot.Start_Time,
            date: selectedDate,
            service_type: selectedService.id,
            specialty_id: selectedSpecialty.id,
            profile_id: selectedProfile.id,
            schedule_id: selectedSlot.SCHEDULE_ID,
            slot_no: selectedSlot.SLOT_NO
        };

        try {
            await api.post('/appointments', payload);
            toast.success(`Đặt lịch thành công cho bệnh nhân ${selectedProfile.name}!`);
            fetchAvailableSlots(selectedDate);
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error('[FE] Lỗi khi đặt lịch');
                console.error('[FE] Lỗi khi đặt lịch', error);
            }
        }
    };

    const isFormComplete = selectedProfile && selectedSpecialty && selectedService && selectedSlot;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white mt-10">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-blue-700 mb-2">Bệnh viện Tâm Anh</h1>
                <p className="text-lg font-bold text-gray-900">Chi nhánh: 2B Phổ Quang, Tân Bình, TP.HCM</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Đặt khám ngay</h2>
            <BookingDateSelector
                dateList={dateList}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                timeslotCount={timeslots.length}
            />
            <BookingTimeSlotGrid
                isLoading={isLoading}
                timeslots={timeslots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
            />
            <BookingDetailsSelector
                selectedProfile={selectedProfile}
                selectedSpecialty={selectedSpecialty}
                selectedService={selectedService}
                onSelectProfile={setSelectedProfile}
                onSelectSpecialty={setSelectedSpecialty}
                onSelectService={setSelectedService}
            />

            <button
                onClick={handleBookAppointment}
                className="w-full bg-[#2b5cc4] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-md uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedSlot}
            >
                Đặt Khám Ngay
            </button>
            {!isFormComplete && (
                <p className="text-center text-xs text-red-500 mt-3 font-medium">
                    * Vui lòng chọn đầy đủ Giờ khám, Hồ sơ, Chuyên khoa và Dịch vụ.
                </p>
            )}
        </div>
    );
};

export default PatientBookingPage;
