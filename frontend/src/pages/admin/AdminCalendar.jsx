import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Phone, User, Clock, Users, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { bookingService } from '../../lib/bookingService';
import { toast } from 'sonner';

// Slot status colors
const slotStatusColors = {
    available: 'bg-white/5 hover:bg-white/10 border-white/10 cursor-pointer',
    booked: 'bg-green-500/20 border-green-500/40 text-green-400',
    paid: 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300',
    pending: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
    cancelled: 'bg-red-500/10 border-red-500/30 text-red-400 opacity-50',
    blocked: 'bg-gray-500/20 border-gray-500/40 text-gray-400'
};

export default function AdminCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [rooms, setRooms] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]); // Fetch from database
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // New booking form state
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        phone: '',
        email: '',
        playerCount: 2,
        status: 'confirmed',
        notes: ''
    });

    // Fetch rooms and time slots on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch rooms
                const roomsData = await bookingService.getRooms();
                setRooms(roomsData);

                // Fetch time slots from database (same source as user booking page)
                const slotsData = await bookingService.getTimeSlots();
                // Transform database format to component format
                const formattedSlots = slotsData.map(slot => ({
                    value: slot.slot_time,
                    label: slot.slot_time, // Database already has formatted time
                    raw: slot
                }));
                setTimeSlots(formattedSlots);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load data');
            }
        };
        fetchInitialData();
    }, []);

    // Fetch bookings when date changes
    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const bookingsData = await bookingService.getBookingsForDate(dateStr);
                setBookings(bookingsData || []);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast.error('Failed to load bookings');
                setBookings([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [selectedDate]);

    // Generate calendar days for the mini calendar
    const calendarDays = useMemo(() => {
        const start = startOfMonth(calendarMonth);
        const end = endOfMonth(calendarMonth);
        return eachDayOfInterval({ start, end });
    }, [calendarMonth]);

    // Get booking for a specific room and time slot
    const getSlotBooking = (roomId, timeSlot) => {
        return bookings.find(
            b => b.room_id === roomId && b.time_slot === timeSlot && b.status !== 'cancelled'
        );
    };

    // Handle slot click
    const handleSlotClick = (room, timeSlot) => {
        const existingBooking = getSlotBooking(room.id, timeSlot.value);

        setSelectedSlot({
            room,
            timeSlot,
            booking: existingBooking || null
        });

        // Reset form for new booking
        if (!existingBooking) {
            setBookingForm({
                customerName: '',
                phone: '',
                email: '',
                playerCount: 2,
                status: 'confirmed',
                notes: ''
            });
        } else {
            // Pre-fill form with existing booking data
            setBookingForm({
                customerName: existingBooking.customer_name || '',
                phone: existingBooking.phone || '',
                email: existingBooking.email || '',
                playerCount: existingBooking.player_count || 2,
                status: existingBooking.status || 'confirmed',
                notes: existingBooking.internal_notes || ''
            });
        }

        setIsSlotModalOpen(true);
    };

    // Create new booking
    const handleCreateBooking = async () => {
        if (!selectedSlot || !bookingForm.customerName || !bookingForm.phone) {
            toast.error('Please fill in customer name and phone');
            return;
        }

        setIsSaving(true);
        try {
            const bookingData = {
                room_id: selectedSlot.room.id,
                booking_date: format(selectedDate, 'yyyy-MM-dd'),
                time_slot: selectedSlot.timeSlot.value,
                customer_name: bookingForm.customerName,
                customer_phone: bookingForm.phone,
                customer_email: bookingForm.email || null,
                player_count: bookingForm.playerCount,
                status: bookingForm.status,
                internal_notes: bookingForm.notes || null,
                total_price: 0, // Admin bookings - price handled offline
                price_per_person: 0
            };

            await bookingService.createBooking(bookingData);
            toast.success('Booking created successfully');

            // Refresh bookings
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const bookingsData = await bookingService.getBookingsForDate(dateStr);
            setBookings(bookingsData || []);

            setIsSlotModalOpen(false);
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error(error.message || 'Failed to create booking');
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel existing booking (make slot available again)
    const handleCancelBooking = async () => {
        if (!selectedSlot?.booking) return;

        setIsSaving(true);
        try {
            await bookingService.updateBookingStatus(selectedSlot.booking.id, 'cancelled');
            toast.success('Booking cancelled - slot is now available');

            // Refresh bookings
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const bookingsData = await bookingService.getBookingsForDate(dateStr);
            setBookings(bookingsData || []);

            setIsSlotModalOpen(false);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error('Failed to cancel booking');
        } finally {
            setIsSaving(false);
        }
    };

    // Update existing booking status
    const handleUpdateBookingStatus = async (newStatus) => {
        if (!selectedSlot?.booking) return;

        setIsSaving(true);
        try {
            await bookingService.updateBookingStatus(selectedSlot.booking.id, newStatus);
            toast.success(`Booking status updated to ${newStatus}`);

            // Refresh bookings
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const bookingsData = await bookingService.getBookingsForDate(dateStr);
            setBookings(bookingsData || []);

            setIsSlotModalOpen(false);
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Failed to update booking');
        } finally {
            setIsSaving(false);
        }
    };

    // Navigate date
    const goToToday = () => setSelectedDate(new Date());
    const goToPrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    // Navigate mini calendar month
    const goToPrevMonth = () => setCalendarMonth(prev => subMonths(prev, 1));
    const goToNextMonth = () => setCalendarMonth(prev => addMonths(prev, 1));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                        Calendar View
                    </h1>
                    <p className="text-[color:var(--text-muted)] mt-1">
                        Manage bookings for all rooms
                    </p>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevDay}
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextDay}
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Mini Calendar Sidebar */}
                <div className="hidden lg:block w-64 shrink-0">
                    <div className="bg-[color:var(--bg-surface)] rounded-xl border border-white/10 p-4">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToPrevMonth}
                                className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium text-white">
                                {format(calendarMonth, 'MMMM yyyy')}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToNextMonth}
                                className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-center text-xs text-white/40 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty cells for days before the first of month */}
                            {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-8" />
                            ))}

                            {calendarDays.map(day => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, new Date());
                                const isCurrentMonth = isSameMonth(day, calendarMonth);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${isSelected
                                            ? 'bg-[color:var(--brand-accent)] text-black'
                                            : isToday
                                                ? 'bg-white/20 text-white'
                                                : isCurrentMonth
                                                    ? 'text-white/80 hover:bg-white/10'
                                                    : 'text-white/30'
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                            <p className="text-xs text-white/50 uppercase font-semibold mb-3">Legend</p>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
                                <span className="text-xs text-white/60">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/40" />
                                <span className="text-xs text-white/60">Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/40" />
                                <span className="text-xs text-white/60">Confirmed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/50" />
                                <span className="text-xs text-white/60">Paid</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Calendar Grid */}
                <div className="flex-1 overflow-x-auto">
                    <div className="bg-[color:var(--bg-surface)] rounded-xl border border-white/10 min-w-[900px]">
                        {/* Date Header */}
                        <div className="px-4 py-3 border-b border-white/10 bg-[color:var(--bg-elevated)]">
                            <h2 className="text-lg font-semibold text-white">
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-[color:var(--brand-accent)] animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    {/* Room Headers */}
                                    <thead>
                                        <tr>
                                            <th className="sticky left-0 bg-[color:var(--bg-surface)] w-20 px-2 py-3 text-left text-xs font-medium text-white/50 uppercase border-b border-r border-white/10 z-10">
                                                Time
                                            </th>
                                            {rooms.map(room => (
                                                <th
                                                    key={room.id}
                                                    className="px-2 py-3 text-center text-xs font-medium text-white border-b border-white/10 min-w-[120px]"
                                                >
                                                    <div className="truncate" title={room.name}>
                                                        {room.name}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Time Slots */}
                                    <tbody>
                                        {timeSlots.map((slot, slotIndex) => (
                                            <tr key={slot.value}>
                                                {/* Time Label */}
                                                <td className="sticky left-0 bg-[color:var(--bg-surface)] px-2 py-1 text-xs font-medium text-white/60 border-r border-white/10 z-10 whitespace-nowrap">
                                                    {slot.label}
                                                </td>

                                                {/* Room Slots */}
                                                {rooms.map(room => {
                                                    const booking = getSlotBooking(room.id, slot.value);
                                                    const status = booking?.status || 'available';
                                                    const colorClass = slotStatusColors[status] || slotStatusColors.available;

                                                    return (
                                                        <td
                                                            key={`${room.id}-${slot.value}`}
                                                            className="p-1"
                                                        >
                                                            <button
                                                                onClick={() => handleSlotClick(room, slot)}
                                                                className={`w-full h-14 rounded-lg border text-xs font-medium transition-all ${colorClass}`}
                                                            >
                                                                {booking ? (
                                                                    <div className="px-1 truncate">
                                                                        <div className="font-semibold truncate">
                                                                            {booking.customer_name || 'Booked'}
                                                                        </div>
                                                                        <div className="text-[10px] opacity-75 capitalize">
                                                                            {status}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-white/30">Available</span>
                                                                )}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slot Modal - Create/Edit/Cancel Booking */}
            <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
                <DialogContent className="bg-[color:var(--bg-elevated)] border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            {selectedSlot?.booking ? (
                                <>
                                    <User className="w-5 h-5 text-[color:var(--brand-accent)]" />
                                    Booking Details
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 text-[color:var(--brand-accent)]" />
                                    Create Booking
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-[color:var(--text-muted)]">
                            {selectedSlot?.room?.name} • {selectedSlot?.timeSlot?.label} • {format(selectedDate, 'MMM d, yyyy')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Customer Name */}
                        <div className="space-y-2">
                            <Label className="text-white">Customer Name *</Label>
                            <Input
                                value={bookingForm.customerName}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                                placeholder="Enter customer name"
                                className="bg-black/30 border-white/10 text-white"
                                disabled={!!selectedSlot?.booking}
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label className="text-white">Phone Number *</Label>
                            <Input
                                value={bookingForm.phone}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+20 xxx xxx xxxx"
                                className="bg-black/30 border-white/10 text-white"
                                disabled={!!selectedSlot?.booking}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="text-white">Email (Optional)</Label>
                            <Input
                                type="email"
                                value={bookingForm.email}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="customer@email.com"
                                className="bg-black/30 border-white/10 text-white"
                                disabled={!!selectedSlot?.booking}
                            />
                        </div>

                        {/* Player Count */}
                        <div className="space-y-2">
                            <Label className="text-white">Number of Players</Label>
                            <Select
                                value={String(bookingForm.playerCount)}
                                onValueChange={(val) => setBookingForm(prev => ({ ...prev, playerCount: parseInt(val) }))}
                                disabled={!!selectedSlot?.booking}
                            >
                                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                                        <SelectItem key={num} value={String(num)} className="text-white">
                                            {num} Players
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status (for existing bookings) */}
                        {selectedSlot?.booking && (
                            <div className="space-y-2">
                                <Label className="text-white">Status</Label>
                                <Select
                                    value={bookingForm.status}
                                    onValueChange={(val) => handleUpdateBookingStatus(val)}
                                >
                                    <SelectTrigger className="bg-black/30 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                                        <SelectItem value="pending" className="text-white">Pending</SelectItem>
                                        <SelectItem value="confirmed" className="text-white">Confirmed</SelectItem>
                                        <SelectItem value="paid" className="text-white">Paid</SelectItem>
                                        <SelectItem value="completed" className="text-white">Completed</SelectItem>
                                        <SelectItem value="no-show" className="text-white">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-white">Internal Notes</Label>
                            <Input
                                value={bookingForm.notes}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Any notes about this booking..."
                                className="bg-black/30 border-white/10 text-white"
                            />
                        </div>

                        {/* Existing Booking Info */}
                        {selectedSlot?.booking && (
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-white/60">
                                    <Phone className="w-4 h-4" />
                                    {selectedSlot.booking.phone}
                                </div>
                                {selectedSlot.booking.email && (
                                    <div className="flex items-center gap-2 text-white/60">
                                        <User className="w-4 h-4" />
                                        {selectedSlot.booking.email}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-white/60">
                                    <Users className="w-4 h-4" />
                                    {selectedSlot.booking.player_count} players
                                </div>
                                {selectedSlot.booking.final_price && (
                                    <div className="flex items-center gap-2 text-white/60">
                                        <CreditCard className="w-4 h-4" />
                                        EGP {selectedSlot.booking.final_price}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        {selectedSlot?.booking ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSlotModalOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelBooking}
                                    disabled={isSaving}
                                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <X className="w-4 h-4 mr-2" />
                                    )}
                                    Cancel Booking
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSlotModalOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateBooking}
                                    disabled={isSaving || !bookingForm.customerName || !bookingForm.phone}
                                    className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Create Booking
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
