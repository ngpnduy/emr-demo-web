import { X } from 'lucide-react';
import { PROFILES, SERVICES, SPECIALTIES } from '@/lib/bookingData';
import { formatDateToVN, formatTime } from '@/lib/dateTime';

const EditAppointmentModal = ({ editForm, dateList, availableSlots, isLoadingSlots, onClose, onFormChange, onSubmit }) => {
    if (!editForm) return null;

    const updateForm = (changes) => onFormChange({ ...editForm, ...changes });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa Lịch khám ({editForm.appointment_id})</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <form onSubmit={onSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-5">
                            <SelectField label="Người khám" value={editForm.new_profile_id} onChange={(value) => updateForm({ new_profile_id: value })}>
                                {PROFILES.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} {profile.relationship ? `(${profile.relationship})` : ''}</option>)}
                            </SelectField>
                            <SelectField label="Chuyên khoa" value={editForm.new_specialty_id} onChange={(value) => updateForm({ new_specialty_id: value })}>
                                {SPECIALTIES.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}
                            </SelectField>
                            <SelectField label="Dịch vụ" value={editForm.new_service_type} onChange={(value) => updateForm({ new_service_type: value })}>
                                {SERVICES.map((service) => <option key={service.id} value={service.id}>{service.label} - {service.price.toLocaleString('vi-VN')} VNĐ</option>)}
                            </SelectField>
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
                                        <div key={dateStr} onClick={() => updateForm({ new_date: dateStr, new_time: '', new_slot_no: null, new_schedule_id: null })} className={`min-w-[130px] flex flex-col items-center justify-center py-2 px-4 rounded-md cursor-pointer transition-colors
                                        ${isActive ? 'bg-[#2b5cc4] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>
                                            <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{formatDateToVN(dateStr)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="min-h-[100px] border rounded-lg p-4 bg-white">
                            {isLoadingSlots ? <div className="text-center text-gray-500 py-6">Đang tải giờ trống...</div> : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {availableSlots.map((slot, index) => {
                                        const isSelected = editForm.new_slot_no === slot.SLOT_NO && editForm.new_schedule_id === slot.SCHEDULE_ID;
                                        const isOriginalSlot = slot.SLOT_NO === editForm.original_slot_no && slot.SCHEDULE_ID === editForm.original_schedule_id;
                                        return (
                                            <button type="button" key={index} onClick={() => updateForm({ new_time: slot.Start_Time, new_slot_no: slot.SLOT_NO, new_schedule_id: slot.SCHEDULE_ID })} className={`py-2 px-3 text-sm font-semibold rounded-md border transition-all relative
                                            ${isSelected ? 'bg-[#2b5cc4] text-white border-[#2b5cc4] shadow-md' : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-[#2b5cc4] hover:text-[#2b5cc4]'}`}>
                                                {formatTime(slot.Start_Time)}
                                                {isOriginalSlot && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">Hiện tại</span>}
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
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all">Hủy bỏ</button>
                        <button type="submit" disabled={!editForm.new_slot_no} className="px-6 py-2.5 bg-[#2b5cc4] hover:bg-blue-800 text-white rounded-lg font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SelectField = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
        <select className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    </div>
);

export default EditAppointmentModal;
