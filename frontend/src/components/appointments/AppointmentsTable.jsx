import { Edit3, Trash2 } from 'lucide-react';

const AppointmentsTable = ({ appointments, isLoading, onEdit, onDelete }) => (
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
                    appointments.map((appointment) => (
                        <tr key={appointment.APPOINTMENT_ID} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-3 py-3 text-xs text-gray-600 font-medium whitespace-nowrap">{appointment.Profile_Name}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 whitespace-nowrap">{new Date(appointment.Appointment_Date).toLocaleDateString('vi-VN')}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 whitespace-nowrap">{appointment.Appointment_Time.substring(0, 5)}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] font-semibold">{appointment.Specialty_Name}</span>
                            </td>
                            <td className="px-3 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">{appointment.SERVICE_TYPE}</td>
                            <td className="px-3 py-3 text-[11px] text-gray-500 leading-relaxed">
                                <p className="font-semibold text-gray-700 whitespace-nowrap">{appointment.Facility_Name}</p>
                                <p className="truncate max-w-[200px]" title={appointment.Branch_Address}>{appointment.Branch_Address}</p>
                            </td>
                            <td className="px-3 py-3 text-xs font-semibold text-emerald-600 whitespace-nowrap">
                                {appointment.Appointment_Fee ? `${appointment.Appointment_Fee.toLocaleString('vi-VN')} đ` : '---'}
                            </td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                {appointment.Billing_Status === 'PAID' ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase border border-green-200">Đã thanh toán</span>
                                ) : (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold uppercase border border-yellow-200">Chưa thanh toán</span>
                                )}
                            </td>
                            <td className="px-3 py-3">
                                <div className="flex items-center justify-center space-x-2">
                                    <button onClick={() => onEdit(appointment)} className="p-1.5 rounded-lg text-gray-400 group-hover:text-blue-600 hover:bg-blue-100 transition-all" title="Chỉnh sửa">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => onDelete(appointment.APPOINTMENT_ID)} className="p-1.5 rounded-lg text-gray-400 group-hover:text-red-600 hover:bg-red-100 transition-all" title="Hủy lịch">
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
);

export default AppointmentsTable;
