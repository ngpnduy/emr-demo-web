import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import PatientBookingPage from './pages/PatientBookingPage.jsx'
import PatientAppointmentsPage from './pages/PatientAppointmentsPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFound from './pages/NotFoundPage.jsx'
import { Toaster } from 'sonner'

function App() {

  return (
    <>
      <Toaster richColors />

      <BrowserRouter>
        <Routes>
          <Route
            path="/booking"
            element={<PatientBookingPage />}
          />

          <Route
            path="/appointments"
            element={<PatientAppointmentsPage />}
          />

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
