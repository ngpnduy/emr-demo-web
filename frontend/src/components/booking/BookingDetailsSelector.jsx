import { PROFILES, SERVICES, SPECIALTIES } from '@/lib/bookingData';

const BookingDetailsSelector = ({
    selectedProfile,
    selectedSpecialty,
    selectedService,
    onSelectProfile,
    onSelectSpecialty,
    onSelectService
}) => (
    <>
        <div className="mb-8">
            <h3 className="text-base font-bold text-gray-800 mb-3">2. Chọn hồ sơ bệnh nhân</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {PROFILES.map((profile) => (
                    <div
                        key={profile.id}
                        onClick={() => onSelectProfile(profile)}
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

        <div className="mb-8">
            <h3 className="text-base font-bold text-gray-800 mb-3">3. Chọn chuyên khoa</h3>
            <div className="flex flex-wrap gap-3">
                {SPECIALTIES.map((specialty) => (
                    <button
                        key={specialty.id}
                        onClick={() => onSelectSpecialty(specialty)}
                        className={`py-2 px-4 text-sm font-semibold rounded-full border transition-all
                        ${selectedSpecialty?.id === specialty.id
                            ? 'bg-[#2b5cc4] text-white border-[#2b5cc4]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#2b5cc4] hover:text-[#2b5cc4]'}`}
                    >
                        {specialty.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-base font-bold text-gray-800 mb-3">4. Chọn loại dịch vụ</h3>
            <div className="flex gap-3">
                {SERVICES.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className={`py-3 px-5 rounded-lg border-2 cursor-pointer transition-all min-w-[160px]
                        ${selectedService?.id === service.id
                            ? 'border-[#2b5cc4] bg-blue-50 text-[#2b5cc4]'
                            : 'border-gray-200 text-gray-700 hover:border-[#2b5cc4]'}`}
                    >
                        <div className="font-semibold text-sm">{service.label}</div>
                        <div className="text-xs mt-1 font-medium opacity-80">{service.price.toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                ))}
            </div>
        </div>
    </>
);

export default BookingDetailsSelector;
