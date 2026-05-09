import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';

// Lấy ngày hôm nay theo chuẩn múi giờ Local (Việt Nam)
const getLocalTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const formatDateToVN = (dateString) => {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${day}-${month}`;
};

const generateDatesUpTo = (startDateStr, endDateStr) => {
    const result = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    while (start <= end) {
        result.push(start.toISOString().split('T')[0]);
        start.setDate(start.getDate() + 1);
    }
    return result;
};

const formatTime = (timeStr) => {
    return timeStr ? timeStr.substring(0, 5) : '';
};

// --- DỮ LIỆU HARDCODE ---
const PROFILES = [
    { id: 'PROF001', name: 'Phạm Nguyễn Công Thành' },
    { id: 'PROF002', name: 'Phạm Văn Mai', relationship: 'Ba' },
    { id: 'PROF003', name: 'Phạm Thị Thơ', relationship: 'Mẹ' }
];

const SPECIALTIES = [
    { id: 'SPEC01', name: 'Khoa Nội Tim Mạch' },
    { id: 'SPEC02', name: 'Khoa Thần Kinh' },
    { id: 'SPEC03', name: 'Khoa Nhi' },
    { id: 'SPEC04', name: 'Khoa Răng Hàm Mặt' }
];

const SERVICES = [
    { id: 'Khám Thường', label: 'Khám Thường', price: 150000 },
    { id: 'Khám Dịch Vụ', label: 'Khám Dịch Vụ', price: 300000 }
];

const PatientBookingPage = ({ customerId = 'C001' }) => {
    const facilityId = 'MF002';
    const branchId = 'BR002';

    const todayStr = getLocalTodayStr();
    const maxDateStr = '2026-05-15'; 

    const [dateList] = useState(generateDatesUpTo(todayStr, maxDateStr)); 
    
    const [selectedProfile, setSelectedProfile] = useState(PROFILES[0]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTIES[0]);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [selectedDate, setSelectedDate] = useState(todayStr); // Mặc định chọn hôm nay
    const [timeslots, setTimeslots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAvailableSlots = async (date) => {
        setIsLoading(true);
        setTimeslots([]);
        setSelectedSlot(null); 
        try {
            const response = await api.get(`/query/timeslots`, {
                params: { facilityId, branchId, date }
            });
            if (response.data.success) {
                setTimeslots(response.data.data);
            }
        } catch (error) {
            console.error("[FE] Lỗi khi tải danh sách giờ trống", error);
            toast.error("[FE] Không thể tải danh sách giờ trống.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableSlots(selectedDate);
    }, [selectedDate]);

    const handleBookAppointment = async () => {
        if (!selectedSlot) {
            toast.error("[FE] Vui lòng chọn một khung giờ để đặt khám!");
            return;
        }

        const appointmentId = `APP_${Math.floor(Math.random() * 10000)}`; 
        
        const payload = {
            appointment_id: appointmentId,
            time: selectedSlot.Start_Time,
            date: selectedDate,
            service_type: selectedService.id,
            specialty_id: selectedSpecialty.id, 
            profile_id: selectedProfile.id,
            schedule_id: selectedSlot.SCHEDULE_ID,
            slot_no: selectedSlot.SLOT_NO
        };

        try {
            await api.post(`/appointments`, payload);
            toast.success(`Đặt lịch thành công cho bệnh nhân ${selectedProfile.name}!`);
            fetchAvailableSlots(selectedDate);
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error("[FE] Lỗi khi đặt lịch");
                console.error("[FE] Lỗi khi đặt lịch", error);
            }
        }
    };

    const isFormComplete = selectedProfile && selectedSpecialty && selectedService && selectedSlot;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white mt-10">
            {/* Header thông tin bệnh viện */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-blue-700 mb-2">Bệnh viện Tâm Anh</h1>
                <p className="text-lg font-bold text-gray-900">Chi nhánh: 2B Phổ Quang, Tân Bình, TP.HCM</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Đặt khám ngay</h2>

            {/* Thanh cuộn ngày */}
            <h3 className="text-base font-bold text-gray-800 mb-3">1. Chọn giờ khám</h3>
            <div className="flex items-center mb-6 w-full">
                
                <div className="flex w-full overflow-x-auto hide-scrollbar border-b border-gray-200">
                    {dateList.map((dateStr) => {
                        const isActive = dateStr === selectedDate;
                        return (
                            <div 
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`min-w-[130px] flex flex-col items-center justify-center py-3 cursor-pointer transition-colors border-b-2 
                                ${isActive ? 'border-blue-600 bg-blue-50 text-gray-900' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                    {formatDateToVN(dateStr)}
                                </span>
                                {isActive && timeslots.length > 0 && (
                                    <span className="text-xs text-green-600 font-medium mt-1">
                                        {timeslots.length} khung giờ
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lưới thời gian (Timeslot Grid) */}
            <div className="min-h-[100px] mb-8">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-8">Đang tải giờ trống...</div>
                ) : timeslots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {timeslots.map((slot, idx) => {
                            const isSelected = selectedSlot?.SLOT_NO === slot.SLOT_NO && selectedSlot?.SCHEDULE_ID === slot.SCHEDULE_ID;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSlot(slot)}
                                    // [CẬP NHẬT UI]: Thêm flex-col và items-center để dàn chữ theo chiều dọc
                                    className={`py-2 px-3 rounded-md border transition-all flex flex-col items-center justify-center
                                    ${isSelected 
                                        ? 'bg-[#2b5cc4] text-white border-[#2b5cc4] shadow-md' 
                                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#2b5cc4] hover:text-[#2b5cc4]'
                                    }`}
                                >
                                    <span className="text-sm font-semibold">
                                        {formatTime(slot.Start_Time)} - {formatTime(slot.End_Time)}
                                    </span>
                                    {/* [THÊM MỚI]: Hiện tỉ lệ Current_Count / MAX_PATIENT_PER_SLOT */}
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

            {/* Chọn Hồ sơ */}
            <div className="mb-8">
                <h3 className="text-base font-bold text-gray-800 mb-3">2. Chọn hồ sơ bệnh nhân</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {PROFILES.map(profile => (
                        <div 
                            key={profile.id}
                            onClick={() => setSelectedProfile(profile)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col
                            ${selectedProfile?.id === profile.id 
                                ? 'border-[#2b5cc4] bg-blue-50' 
                                : 'border-gray-200 hover:border-[#2b5cc4]'}`}
                        >
                            <span className="font-semibold text-sm text-gray-900">{profile.name}</span>
                            {profile.relationship && (
                                <span className="text-xs text-gray-500 mt-1">
                                    Quan hệ: <span className="font-medium text-[#2b5cc4]">{profile.relationship}</span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chọn Chuyên khoa */}
            <div className="mb-8">
                <h3 className="text-base font-bold text-gray-800 mb-3">3. Chọn chuyên khoa</h3>
                <div className="flex flex-wrap gap-3">
                    {SPECIALTIES.map(spec => (
                        <button
                            key={spec.id}
                            onClick={() => setSelectedSpecialty(spec)}
                            className={`py-2 px-4 text-sm font-semibold rounded-full border transition-all
                            ${selectedSpecialty?.id === spec.id 
                                ? 'bg-[#2b5cc4] text-white border-[#2b5cc4]' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#2b5cc4] hover:text-[#2b5cc4]'}`}
                        >
                            {spec.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chọn Dịch vụ */}
            <div className="mb-8">
                <h3 className="text-base font-bold text-gray-800 mb-3">4. Chọn loại dịch vụ</h3>
                <div className="flex gap-3">
                    {SERVICES.map(srv => (
                        <div
                            key={srv.id}
                            onClick={() => setSelectedService(srv)}
                            className={`py-3 px-5 rounded-lg border-2 cursor-pointer transition-all min-w-[160px]
                            ${selectedService?.id === srv.id 
                                ? 'border-[#2b5cc4] bg-blue-50 text-[#2b5cc4]' 
                                : 'border-gray-200 text-gray-700 hover:border-[#2b5cc4]'}`}
                        >
                            <div className="font-semibold text-sm">{srv.label}</div>
                            <div className="text-xs mt-1 font-medium opacity-80">{srv.price.toLocaleString('vi-VN')} VNĐ</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nút Xác nhận Đặt */}
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