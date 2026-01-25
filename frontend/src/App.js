import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ScrollToTop from "./components/ScrollToTop";

// Suppress ResizeObserver errors (common with Radix UI)
const suppressResizeObserverError = () => {
  const resizeObserverErr = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (message === 'ResizeObserver loop completed with undelivered notifications.' ||
        message === 'ResizeObserver loop limit exceeded') {
      return true;
    }
    if (resizeObserverErr) {
      return resizeObserverErr(message, source, lineno, colno, error);
    }
    return false;
  };
};
suppressResizeObserverError();

// Pages
import HomePage from "./pages/HomePage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import FindUsPage from "./pages/FindUsPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminCustomers from "./pages/admin/AdminCustomers";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:slug" element={<RoomDetailPage />} />
          <Route path="/book/:slug" element={<BookingPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/find-us" element={<FindUsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;
