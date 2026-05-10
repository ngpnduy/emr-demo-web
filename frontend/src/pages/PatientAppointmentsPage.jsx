import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Trash2, Edit3, X, ArrowUpDown, Calculator, CalendarDays } from 'lucide-react'; 

const getLocalDateString = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
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

const PatientAppointments = ({ customerId = 'C001' }) => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('all'); 
    const [sortOrder, setSortOrder] = useState('DESC');
    const [searchDate, setSearchDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [expenseDates, setExpenseDates] = useState({
        fromDate: '2026-01-01',
        toDate: getLocalDateString()
    });
    const [expenseReport, setExpenseReport] = useState(null);
    
    const todayStr = getLocalDateString();
    const maxDateStr = '2026-06-11'; 
    const [dateList] = useState(generateDatesUpTo(todayStr, maxDateStr));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const queryParams = { filter: filter, sort: sortOrder };
            if (searchDate !== '') {
                queryParams.searchDate = searchDate;
            }

            const response = await api.get(`/query/patients/${customerId}/appointments`, {
                params: queryParams
            });
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error("[FE] Lỗi khi tải danh sách lịch khám", error);
            toast.error("[FE] Không thể tải danh sách lịch khám.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [customerId, filter, sortOrder, searchDate]);

    const handleCalculateFamilyExpense = async () => {
        if (!expenseDates.fromDate || !expenseDates.toDate) {
            toast.error("[FE] Vui lòng chọn đầy đủ Từ ngày và Đến ngày.");
            return;
        }


        setIsCalculating(true);
        try {
            const expensePromises = PROFILES.map(async (profile) => {
                const response = await api.get(`/query/profiles/${profile.id}/expense`, {
                    params: { fromDate: expenseDates.fromDate, toDate: expenseDates.toDate }
                });
                return {
                    name: profile.name,
                    relationship: profile.relationship || 'Tôi',
                    amount: parseFloat(response.data.data) || 0
                };
            });

            const results = await Promise.all(expensePromises);
            const totalAmount = results.reduce((sum, item) => sum + item.amount, 0);

            setExpenseReport({
                totalFamily: totalAmount,
                details: results
            });
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error("[FE] Có lỗi xảy ra khi tính toán viện phí.");
                console.error("[FE] Lỗi tính toán viện phí", error);
            }
        } finally {
            setIsCalculating(false);
        }
    };

    useEffect(() => {
        setExpenseReport(null);
    }, [isExpenseModalOpen, expenseDates]);

    // --- MODAL & API CALLS ---
    const fetchAvailableSlotsForModal = async (dateStr, formState) => {
        setIsLoadingSlots(true);
        try {
            const response = await api.get(`/query/timeslots`, {
                params: { facilityId: 'MF002', branchId: 'BR002', date: dateStr }
            });
            
            if (response.data.success) {
                let fetchedSlots = response.data.data;
                
                if (formState && dateStr === formState.original_date) {
                    const isSlotExist = fetchedSlots.some(s => s.SLOT_NO === formState.original_slot_no && s.SCHEDULE_ID === formState.original_schedule_id);
                    if (!isSlotExist) {
                        fetchedSlots.push({
                            SLOT_NO: formState.original_slot_no,
                            SCHEDULE_ID: formState.original_schedule_id,
                            Start_Time: formState.original_time,
                            End_Time: '??:??'
                        });
                        fetchedSlots.sort((a, b) => a.Start_Time.localeCompare(b.Start_Time));
                    }
                }
                setAvailableSlots(fetchedSlots);
            }
        } catch (error) {
            console.error("[FE] Lỗi khi tải danh sách giờ trống", error);
            toast.error("[FE] Không thể tải danh sách giờ trống.");
        } finally {
            setIsLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (isEditModalOpen && editForm?.new_date) {
            fetchAvailableSlotsForModal(editForm.new_date, editForm);
        }
    }, [editForm?.new_date, isEditModalOpen]);

    const handleEditClick = (app) => {
        const mappedProfileId = app.PROFILE_ID || PROFILES.find(p => p.name === app.Profile_Name)?.id || PROFILES[0].id;
        const mappedSpecialtyId = app.SPECIALTY_ID || SPECIALTIES.find(s => s.name === app.Specialty_Name)?.id || SPECIALTIES[0].id;
        
        const appDate = getLocalDateString(app.Appointment_Date);

        setEditForm({
            appointment_id: app.APPOINTMENT_ID,
            original_date: appDate,
            original_time: app.Appointment_Time,
            original_schedule_id: app.SCHEDULE_ID || 'SCH002', 
            original_slot_no: app.SLOT_NO || 1, 

            new_date: appDate,
            new_time: app.Appointment_Time,
            new_profile_id: mappedProfileId,
            new_specialty_id: mappedSpecialtyId,
            new_service_type: app.SERVICE_TYPE || SERVICES[0].id,
            new_schedule_id: app.SCHEDULE_ID || 'SCH002',
            new_slot_no: app.SLOT_NO || 1,

            Facility_Name: app.Facility_Name,
            Branch_Address: app.Branch_Address
        });
        
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editForm.new_time || !editForm.new_slot_no) {
            toast.error("[FE] Vui lòng chọn một khung giờ khám hợp lệ.");
            return;
        }
        try {
            await api.put(`/appointments/${editForm.appointment_id}`, editForm);
            toast.success("Cập nhật lịch khám thành công!");
            setIsEditModalOpen(false);
            fetchAppointments(); 
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error("[FE] Lỗi khi cập nhật lịch khám.");
                console.error("[FE] Lỗi khi cập nhật lịch khám.", error);
            }
        }
    };

    const handleDelete = async (appointmentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch khám này không?")) return;
        try {
            const response = await api.delete(`/appointments/${appointmentId}`);
            if (response.data.success) {
                toast.success("Đã hủy lịch khám thành công.");
                fetchAppointments(); 
            }
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error("[FE] Lỗi hệ thống khi xóa lịch khám.");
                console.error("[FE] Lỗi hệ thống khi xóa lịch khám.", error);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 bg-white mt-10">
            <div className="flex justify-between items-end mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lịch khám đã đặt</h1>
                <button 
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-all"
                >
                    <Calculator size={18} />
                    Thống kê chi tiêu
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                        {[{ id: 'all', label: 'Tất cả' }, { id: 'upcoming', label: 'Sắp tới' }, { id: 'past', label: 'Đã qua' }].map((btn) => {
                            const isDisabled = searchDate !== '';
                            return (
                                <button
                                    key={btn.id}
                                    disabled={isDisabled}
                                    onClick={() => setFilter(btn.id)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all border
                                    ${isDisabled 
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' 
                                        : filter === btn.id 
                                            ? 'bg-[#2b5cc4] text-white border-[#2b5cc4] shadow-md' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
                        <label className="text-sm font-medium text-gray-600">Tìm ngày:</label>
                        <input 
                            type="date" 
                            value={searchDate}
                            onChange={(e) => {
                                setSearchDate(e.target.value);
                                if (e.target.value) setFilter('all'); 
                            }}
                            className="border p-1.5 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {searchDate && (
                            <button 
                                onClick={() => setSearchDate('')} 
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
                >
                    <ArrowUpDown size={16} className="text-[#2b5cc4]" />
                    {sortOrder === 'DESC' ? 'Mới nhất trước' : 'Cũ nhất trước'}
                </button>
            </div>

            {/* --- KHU VỰC BẢNG ĐÃ ĐƯỢC ĐIỀU CHỈNH THU NHỎ LẠI --- */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse min-w-[950px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Người khám</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Ngày khám</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Giờ</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Chuyên khoa</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Dịch vụ</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Nơi khám</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs whitespace-nowrap">Chi phí</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs text-center whitespace-nowrap">Trạng thái</th>
                            <th className="px-3 py-3 font-semibold text-gray-700 text-xs text-center whitespace-nowrap">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="9" className="p-8 text-center text-sm text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : appointments.length > 0 ? (
                            appointments.map((app) => (
                                <tr key={app.APPOINTMENT_ID} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-3 py-3 text-xs text-gray-600 font-medium whitespace-nowrap">{app.Profile_Name}</td>
                                    <td className="px-3 py-3 text-xs text-gray-900 whitespace-nowrap">{new Date(app.Appointment_Date).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-3 py-3 text-xs text-gray-900 whitespace-nowrap">{app.Appointment_Time.substring(0, 5)}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] font-semibold">{app.Specialty_Name}</span>
                                    </td>
                                    <td className="px-3 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">{app.SERVICE_TYPE}</td>
                                    <td className="px-3 py-3 text-[11px] text-gray-500 leading-relaxed">
                                        <p className="font-semibold text-gray-700 whitespace-nowrap">{app.Facility_Name}</p>
                                        <p className="truncate max-w-[200px]" title={app.Branch_Address}>{app.Branch_Address}</p>
                                    </td>
                                    <td className="px-3 py-3 text-xs font-semibold text-emerald-600 whitespace-nowrap">
                                        {app.Appointment_Fee ? `${app.Appointment_Fee.toLocaleString('vi-VN')} đ` : '---'}
                                    </td>
                                    <td className="px-3 py-3 text-center whitespace-nowrap">
                                        {app.Billing_Status === 'PAID' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase border border-green-200">
                                                Đã thanh toán
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold uppercase border border-yellow-200">
                                                Chưa thanh toán
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleEditClick(app)}
                                                className="p-1.5 rounded-lg text-gray-400 group-hover:text-blue-600 hover:bg-blue-100 transition-all"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(app.APPOINTMENT_ID)}
                                                className="p-1.5 rounded-lg text-gray-400 group-hover:text-red-600 hover:bg-red-100 transition-all"
                                                title="Hủy lịch"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="9" className="p-8 text-center text-sm text-gray-400">Không tìm thấy lịch khám phù hợp.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* --- KẾT THÚC KHU VỰC BẢNG --- */}

            {isExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="flex justify-between items-center p-5 border-b bg-emerald-50">
                            <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                                <Calculator size={22} />
                                Báo cáo Chi tiêu Y tế
                            </h2>
                            <button onClick={() => setIsExpenseModalOpen(false)} className="text-emerald-500 hover:text-emerald-700 bg-white rounded-full p-1 shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Từ ngày</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarDays size={16} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="date" 
                                            value={expenseDates.fromDate}
                                            onChange={(e) => setExpenseDates({...expenseDates, fromDate: e.target.value})}
                                            className="w-full border border-gray-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Đến ngày</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarDays size={16} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="date" 
                                            value={expenseDates.toDate}
                                            onChange={(e) => setExpenseDates({...expenseDates, toDate: e.target.value})}
                                            className="w-full border border-gray-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCalculateFamilyExpense}
                                disabled={isCalculating}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isCalculating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Đang tính toán...
                                    </>
                                ) : "Bắt đầu tính toán"}
                            </button>

                            {expenseReport && (
                                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center mb-5">
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tổng chi phí</p>
                                        <p className="text-4xl font-black text-emerald-600">
                                            {expenseReport.totalFamily.toLocaleString('vi-VN')} <span className="text-2xl text-emerald-400">VNĐ</span>
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="space-y-3">
                                            {expenseReport.details.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{detail.name}</p>
                                                        <p className="text-xs text-gray-500">{detail.relationship}</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {detail.amount.toLocaleString('vi-VN')} đ
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && editForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa Lịch khám ({editForm.appointment_id})</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Người khám</label>
                                        <select className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={editForm.new_profile_id} onChange={e => setEditForm({...editForm, new_profile_id: e.target.value})}>
                                            {PROFILES.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} {p.relationship ? `(${p.relationship})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Chuyên khoa</label>
                                        <select className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={editForm.new_specialty_id} onChange={e => setEditForm({...editForm, new_specialty_id: e.target.value})}>
                                            {SPECIALTIES.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dịch vụ</label>
                                        <select className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={editForm.new_service_type} onChange={e => setEditForm({...editForm, new_service_type: e.target.value})}>
                                            {SERVICES.map(s => (
                                                <option key={s.id} value={s.id}>{s.label} - {s.price.toLocaleString('vi-VN')} VNĐ</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex flex-col justify-center">
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-2">Nơi khám (Cố định)</p>
                                    <p className="font-semibold text-gray-800 text-lg mb-1">{editForm.Facility_Name}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{editForm.Branch_Address}</p>
                                </div>
                            </div>

                            <div className="border-t pt-5">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Thời gian khám</label>
                                
                                <div className="flex items-center mb-4 w-full bg-gray-50 rounded-lg p-2 border">
                                    <div className="flex w-full overflow-x-auto hide-scrollbar">
                                        {dateList.map((dateStr) => {
                                            const isActive = dateStr === editForm.new_date;
                                            return (
                                                <div 
                                                    key={dateStr}
                                                    onClick={() => {
                                                        setEditForm({...editForm, new_date: dateStr, new_time: '', new_slot_no: null, new_schedule_id: null});
                                                    }}
                                                    className={`min-w-[130px] flex flex-col items-center justify-center py-2 px-4 rounded-md cursor-pointer transition-colors
                                                    ${isActive ? 'bg-[#2b5cc4] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                                        {formatDateToVN(dateStr)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="min-h-[100px] border rounded-lg p-4 bg-white">
                                    {isLoadingSlots ? (
                                        <div className="text-center text-gray-500 py-6">Đang tải giờ trống...</div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {availableSlots.map((slot, idx) => {
                                                const isSelected = editForm.new_slot_no === slot.SLOT_NO && editForm.new_schedule_id === slot.SCHEDULE_ID;
                                                const isOriginalSlot = slot.SLOT_NO === editForm.original_slot_no && slot.SCHEDULE_ID === editForm.original_schedule_id;

                                                return (
                                                    <button
                                                        type="button"
                                                        key={idx}
                                                        onClick={() => setEditForm({...editForm, new_time: slot.Start_Time, new_slot_no: slot.SLOT_NO, new_schedule_id: slot.SCHEDULE_ID})}
                                                        className={`py-2 px-3 text-sm font-semibold rounded-md border transition-all relative
                                                        ${isSelected 
                                                            ? 'bg-[#2b5cc4] text-white border-[#2b5cc4] shadow-md' 
                                                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-[#2b5cc4] hover:text-[#2b5cc4]'
                                                        }`}
                                                    >
                                                        {formatTime(slot.Start_Time)}
                                                        {isOriginalSlot && (
                                                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
                                                                Hiện tại
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-6 flex flex-col items-center">
                                            <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Không có giờ trống trong ngày này. Vui lòng chọn ngày khác!
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all">
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={!editForm.new_slot_no}
                                    className="px-6 py-2.5 bg-[#2b5cc4] hover:bg-blue-800 text-white rounded-lg font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;