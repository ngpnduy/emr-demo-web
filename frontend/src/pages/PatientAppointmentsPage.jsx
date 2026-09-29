import { useCallback, useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';
import { toast } from 'sonner';
import AppointmentFilters from '@/components/appointments/AppointmentFilters';
import AppointmentsTable from '@/components/appointments/AppointmentsTable';
import EditAppointmentModal from '@/components/appointments/EditAppointmentModal';
import FamilyExpenseModal from '@/components/appointments/FamilyExpenseModal';
import { PROFILES, SERVICES, SPECIALTIES } from '@/lib/bookingData';
import { generateDatesUpTo, getLocalDateString } from '@/lib/dateTime';
import api from '@/lib/axios';

const PatientAppointmentsPage = ({ customerId = 'C001' }) => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [searchDate, setSearchDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [expenseDates, setExpenseDates] = useState({ fromDate: '2026-01-01', toDate: getLocalDateString() });
    const [expenseReport, setExpenseReport] = useState(null);
    const [dateList] = useState(generateDatesUpTo(getLocalDateString(), '2026-06-11'));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { filter, sort: sortOrder };
            if (searchDate !== '') params.searchDate = searchDate;

            const response = await api.get(`/query/patients/${customerId}/appointments`, { params });
            if (response.data.success) setAppointments(response.data.data);
        } catch (error) {
            console.error('[FE] Lỗi khi tải danh sách lịch khám', error);
            toast.error('[FE] Không thể tải danh sách lịch khám.');
        } finally {
            setIsLoading(false);
        }
    }, [customerId, filter, sortOrder, searchDate]);

    useEffect(() => {
        // Appointment loading is an intentional external data synchronization on filter changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCalculateFamilyExpense = async () => {
        if (!expenseDates.fromDate || !expenseDates.toDate) {
            toast.error('[FE] Vui lòng chọn đầy đủ Từ ngày và Đến ngày.');
            return;
        }

        setIsCalculating(true);
        try {
            const details = await Promise.all(PROFILES.map(async (profile) => {
                const response = await api.get(`/query/profiles/${profile.id}/expense`, {
                    params: { fromDate: expenseDates.fromDate, toDate: expenseDates.toDate }
                });
                return {
                    name: profile.name,
                    relationship: profile.relationship || 'Tôi',
                    amount: parseFloat(response.data.data) || 0
                };
            }));
            setExpenseReport({
                totalFamily: details.reduce((sum, item) => sum + item.amount, 0),
                details
            });
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error('[FE] Có lỗi xảy ra khi tính toán viện phí.');
                console.error('[FE] Lỗi tính toán viện phí', error);
            }
        } finally {
            setIsCalculating(false);
        }
    };

    const fetchAvailableSlotsForModal = useCallback(async (dateStr, formState) => {
        setIsLoadingSlots(true);
        try {
            const response = await api.get('/query/timeslots', {
                params: { facilityId: 'MF002', branchId: 'BR002', date: dateStr }
            });
            if (response.data.success) {
                const fetchedSlots = response.data.data;
                if (formState && dateStr === formState.original_date) {
                    const isSlotExist = fetchedSlots.some((slot) => slot.SLOT_NO === formState.original_slot_no && slot.SCHEDULE_ID === formState.original_schedule_id);
                    if (!isSlotExist) {
                        fetchedSlots.push({
                            SLOT_NO: formState.original_slot_no,
                            SCHEDULE_ID: formState.original_schedule_id,
                            Start_Time: formState.original_time,
                            End_Time: '??:??'
                        });
                        fetchedSlots.sort((first, second) => first.Start_Time.localeCompare(second.Start_Time));
                    }
                }
                setAvailableSlots(fetchedSlots);
            }
        } catch (error) {
            console.error('[FE] Lỗi khi tải danh sách giờ trống', error);
            toast.error('[FE] Không thể tải danh sách giờ trống.');
        } finally {
            setIsLoadingSlots(false);
        }
    }, []);

    useEffect(() => {
        if (isEditModalOpen && editForm?.new_date) {
            // Slot loading is an intentional external data synchronization on date changes.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchAvailableSlotsForModal(editForm.new_date, editForm);
        }
        // The selected date is the only form value that should trigger a slot reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editForm?.new_date, isEditModalOpen, fetchAvailableSlotsForModal]);

    const handleEditClick = (appointment) => {
        const profileId = appointment.PROFILE_ID || PROFILES.find((profile) => profile.name === appointment.Profile_Name)?.id || PROFILES[0].id;
        const specialtyId = appointment.SPECIALTY_ID || SPECIALTIES.find((specialty) => specialty.name === appointment.Specialty_Name)?.id || SPECIALTIES[0].id;
        const appointmentDate = getLocalDateString(appointment.Appointment_Date);

        setEditForm({
            appointment_id: appointment.APPOINTMENT_ID,
            original_date: appointmentDate,
            original_time: appointment.Appointment_Time,
            original_schedule_id: appointment.SCHEDULE_ID || 'SCH002',
            original_slot_no: appointment.SLOT_NO || 1,
            new_date: appointmentDate,
            new_time: appointment.Appointment_Time,
            new_profile_id: profileId,
            new_specialty_id: specialtyId,
            new_service_type: appointment.SERVICE_TYPE || SERVICES[0].id,
            new_schedule_id: appointment.SCHEDULE_ID || 'SCH002',
            new_slot_no: appointment.SLOT_NO || 1,
            Facility_Name: appointment.Facility_Name,
            Branch_Address: appointment.Branch_Address
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (event) => {
        event.preventDefault();
        if (!editForm.new_time || !editForm.new_slot_no) {
            toast.error('[FE] Vui lòng chọn một khung giờ khám hợp lệ.');
            return;
        }
        try {
            await api.put(`/appointments/${editForm.appointment_id}`, editForm);
            toast.success('Cập nhật lịch khám thành công!');
            setIsEditModalOpen(false);
            fetchAppointments();
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error('[FE] Lỗi khi cập nhật lịch khám.');
                console.error('[FE] Lỗi khi cập nhật lịch khám.', error);
            }
        }
    };

    const handleDelete = async (appointmentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch khám này không?')) return;
        try {
            const response = await api.delete(`/appointments/${appointmentId}`);
            if (response.data.success) {
                toast.success('Đã hủy lịch khám thành công.');
                fetchAppointments();
            }
        } catch (error) {
            const dbErrorMsg = error.response?.data?.message;
            if (dbErrorMsg) {
                toast.error(dbErrorMsg);
                console.error(dbErrorMsg);
            } else {
                toast.error('[FE] Lỗi hệ thống khi xóa lịch khám.');
                console.error('[FE] Lỗi hệ thống khi xóa lịch khám.', error);
            }
        }
    };

    const handleSearchDateChange = (date) => {
        setSearchDate(date);
        if (date) setFilter('all');
    };

    const handleExpenseDateChange = (field, value) => {
        setExpenseDates({ ...expenseDates, [field]: value });
        setExpenseReport(null);
    };

    const openExpenseModal = () => {
        setExpenseReport(null);
        setIsExpenseModalOpen(true);
    };

    const closeExpenseModal = () => {
        setIsExpenseModalOpen(false);
        setExpenseReport(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-8 bg-white mt-10">
            <div className="flex justify-between items-end mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lịch khám đã đặt</h1>
                <button onClick={openExpenseModal} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-all">
                    <Calculator size={18} />
                    Thống kê chi tiêu
                </button>
            </div>

            <AppointmentFilters
                filter={filter}
                searchDate={searchDate}
                sortOrder={sortOrder}
                onFilterChange={setFilter}
                onSearchDateChange={handleSearchDateChange}
                onSortToggle={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
            />
            <AppointmentsTable appointments={appointments} isLoading={isLoading} onEdit={handleEditClick} onDelete={handleDelete} />

            {isExpenseModalOpen && (
                <FamilyExpenseModal
                    expenseDates={expenseDates}
                    expenseReport={expenseReport}
                    isCalculating={isCalculating}
                    onClose={closeExpenseModal}
                    onDateChange={handleExpenseDateChange}
                    onCalculate={handleCalculateFamilyExpense}
                />
            )}
            {isEditModalOpen && (
                <EditAppointmentModal
                    editForm={editForm}
                    dateList={dateList}
                    availableSlots={availableSlots}
                    isLoadingSlots={isLoadingSlots}
                    onClose={() => setIsEditModalOpen(false)}
                    onFormChange={setEditForm}
                    onSubmit={handleUpdateSubmit}
                />
            )}
        </div>
    );
};

export default PatientAppointmentsPage;
