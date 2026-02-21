import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ScrollToTop from "./components/ScrollToTop";
import { trackPageView } from "./lib/posthog";

// Suppress ResizeObserver errors (common with Radix UI components like Select/Dialog)
// These errors are harmless and occur frequently with dynamic UI components
const suppressResizeObserverError = () => {
  // Suppress via window.onerror
  const resizeObserverErr = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('ResizeObserver')) {
      return true;
    }
    if (resizeObserverErr) {
      return resizeObserverErr(message, source, lineno, colno, error);
    }
    return false;
  };

  // Suppress via error event listener (catches React error overlay)
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('ResizeObserver')) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return true;
    }
  }, true);

  // Suppress via unhandledrejection (for Promise-based errors)
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message &&
      event.reason.message.includes('ResizeObserver')) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return true;
    }
  }, true);
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

// Event Pages
import EventsPage from "./pages/EventsPage";
import CorporateEventPage from "./pages/CorporateEventPage";
import SchoolTripsPage from "./pages/SchoolTripsPage";
import BirthdayEventPage from "./pages/BirthdayEventPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminExternalCustomers from "./pages/admin/AdminExternalCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// PostHog SPA page tracker - fires on every route change
function PostHogPageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, {
      search: location.search,
      hash: location.hash
    });
  }, [location.pathname, location.search, location.hash]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <PostHogPageTracker />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:slug" element={<RoomDetailPage />} />
          <Route path="/book/:slug" element={<BookingPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/find-us" element={<FindUsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Event Routes */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/corporate" element={<CorporateEventPage />} />
          <Route path="/events/school-trips" element={<SchoolTripsPage />} />
          <Route path="/events/birthdays" element={<BirthdayEventPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="external-customers" element={<AdminExternalCustomers />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;

