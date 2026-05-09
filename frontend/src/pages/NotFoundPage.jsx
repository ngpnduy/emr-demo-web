import React from 'react'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-slate-50">
      <img 
        src="404_NotFound.png" 
        alt="not found" 
        className="w-full max-w-sm mb-8 transition-transform duration-300 hover:scale-105"
      />
      <div className="max-w-md">
        <h1 className="mb-2 text-4xl font-bold text-slate-800">Oops!</h1>
        <p className="text-lg font-medium text-slate-600">
          Trang này không tồn tại.
        </p>
      </div>
      <a 
        href="/" 
        className="inline-block px-8 py-3 mt-10 font-semibold text-white transition-all duration-200 transform bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:-translate-y-1 active:scale-95"
      >
        Trở về trang chủ
      </a>
    </div>
  )
}

export default NotFound