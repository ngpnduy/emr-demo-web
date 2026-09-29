import { ArrowUpDown } from 'lucide-react';

const FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'upcoming', label: 'Sắp tới' },
    { id: 'past', label: 'Đã qua' }
];

const AppointmentFilters = ({ filter, searchDate, sortOrder, onFilterChange, onSearchDateChange, onSortToggle }) => {
    const isFilterDisabled = searchDate !== '';

    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                    {FILTERS.map((button) => (
                        <button
                            key={button.id}
                            disabled={isFilterDisabled}
                            onClick={() => onFilterChange(button.id)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all border
                            ${isFilterDisabled
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                : filter === button.id
                                    ? 'bg-[#2b5cc4] text-white border-[#2b5cc4] shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
                    <label className="text-sm font-medium text-gray-600">Tìm ngày:</label>
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(event) => onSearchDateChange(event.target.value)}
                        className="border p-1.5 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {searchDate && (
                        <button
                            onClick={() => onSearchDateChange('')}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                        >
                            Xóa
                        </button>
                    )}
                </div>
            </div>

            <button
                onClick={onSortToggle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
            >
                <ArrowUpDown size={16} className="text-[#2b5cc4]" />
                {sortOrder === 'DESC' ? 'Mới nhất trước' : 'Cũ nhất trước'}
            </button>
        </div>
    );
};

export default AppointmentFilters;
