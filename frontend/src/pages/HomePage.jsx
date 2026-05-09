import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, ClipboardList, Activity, User } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                
                {/* Ô 1: Đặt lịch khám */}
                <Link to="/booking" className="group">
                    <div className="h-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                        <div className="mb-6 p-5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <CalendarPlus size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Đặt Lịch Khám Mới</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Tra cứu giờ trống, đăng ký lịch hẹn trực tuyến chỉ trong vài phút.
                        </p>
                        <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Bắt đầu ngay
                        </div>
                    </div>
                </Link>

                {/* Ô 2: Xem danh sách lịch khám */}
                <Link to="/appointments" className="group">
                    <div className="h-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                        <div className="mb-6 p-5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <ClipboardList size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Lịch Sử Khám Bệnh</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Quản lý toàn bộ các cuộc hẹn đã đặt, cập nhật thông tin cá nhân hoặc hủy lịch nếu có thay đổi.
                        </p>
                        <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Xem danh sách
                        </div>
                    </div>
                </Link>

            </div>
        </div>
    );
};

export default HomePage;