import { Calculator, CalendarDays, X } from 'lucide-react';

const FamilyExpenseModal = ({ expenseDates, expenseReport, isCalculating, onClose, onDateChange, onCalculate }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-5 border-b bg-emerald-50">
                <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                    <Calculator size={22} />
                    Báo cáo Chi tiêu Y tế
                </h2>
                <button onClick={onClose} className="text-emerald-500 hover:text-emerald-700 bg-white rounded-full p-1 shadow-sm">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6">
                <div className="flex gap-4 mb-6">
                    <DateInput label="Từ ngày" value={expenseDates.fromDate} onChange={(value) => onDateChange('fromDate', value)} />
                    <DateInput label="Đến ngày" value={expenseDates.toDate} onChange={(value) => onDateChange('toDate', value)} />
                </div>

                <button onClick={onCalculate} disabled={isCalculating} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                    {isCalculating ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Đang tính toán...
                        </>
                    ) : 'Bắt đầu tính toán'}
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
                                {expenseReport.details.map((detail, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{detail.name}</p>
                                            <p className="text-xs text-gray-500">{detail.relationship}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{detail.amount.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const DateInput = ({ label, value, onChange }) => (
    <div className="flex-1">
        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays size={16} className="text-gray-400" />
            </div>
            <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-gray-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700" />
        </div>
    </div>
);

export default FamilyExpenseModal;
