import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Phone, MessageCircle, CheckCircle, Clock, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { bookingService } from '../../lib/bookingService';
import { bookingAdapter } from '../../lib/adapters';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Phone },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-[color:var(--brand-accent)]/10 text-[color:var(--brand-accent)] border-[color:var(--brand-accent)]/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: XCircle },
  'no-show': { label: 'No Show', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: AlertCircle }
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data.map(bookingAdapter));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.includes(searchQuery) ||
      booking.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      toast.success(`Booking status updated to ${statusConfig[newStatus].label}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    // Find the raw booking object to access more fields if needed
    setNotes(booking.notes || '');
    setIsDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    try {
      await bookingService.updateBookingNotes(selectedBooking.id, notes);
      setBookings(prev => prev.map(b =>
        b.id === selectedBooking.id ? { ...b, notes } : b
      ));
      toast.success('Notes saved');
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Bookings</h1>
          <p className="text-[color:var(--text-muted)] mt-1">Manage all booking requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--text-muted)]" />
          <Input
            placeholder="Search by name, phone, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-black/30 border-white/10 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 h-11 rounded-xl bg-black/30 border-white/10 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <Card className="bg-[color:var(--bg-surface)] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[color:var(--brand-accent)] animate-spin" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-[color:var(--text-muted)]">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-[color:var(--text-muted)]">Room</th>
                    <th className="text-left p-4 text-sm font-medium text-[color:var(--text-muted)]">Date & Time</th>
                    <th className="text-left p-4 text-sm font-medium text-[color:var(--text-muted)]">Players</th>
                    <th className="text-left p-4 text-sm font-medium text-[color:var(--text-muted)]">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-[color:var(--text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const status = statusConfig[booking.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">{booking.customerName}</p>
                            <p className="text-sm text-[color:var(--text-muted)]">{booking.customerPhone}</p>
                          </div>
                        </td>
                        <td className="p-4 text-[color:var(--text-secondary)]">{booking.roomName}</td>
                        <td className="p-4">
                          <p className="text-white">{format(new Date(booking.date), 'MMM dd, yyyy')}</p>
                          <p className="text-sm text-[color:var(--text-muted)]">{booking.timeSlot}</p>
                        </td>
                        <td className="p-4 text-[color:var(--text-secondary)]">{booking.players}</td>
                        <td className="p-4">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <a href={`tel:${booking.customerPhone}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)]">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </a>
                            <a href={`https://wa.me/${booking.customerPhone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[color:var(--text-muted)] hover:text-green-400">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </a>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[color:var(--text-muted)] hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[color:var(--bg-elevated)] border-white/10">
                                <DropdownMenuItem onClick={() => handleViewDetails(booking)} className="text-white hover:bg-white/10">
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'contacted')} className="text-white hover:bg-white/10">
                                  Mark Contacted
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'confirmed')} className="text-white hover:bg-white/10">
                                  Confirm Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'completed')} className="text-white hover:bg-white/10">
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'cancelled')} className="text-red-400 hover:bg-red-500/10">
                                  Cancel Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && filteredBookings.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-[color:var(--text-muted)]">No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[color:var(--bg-elevated)] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[color:var(--text-muted)]">Customer</Label>
                  <p className="text-white">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <Label className="text-[color:var(--text-muted)]">Phone</Label>
                  <p className="text-white">{selectedBooking.customerPhone}</p>
                </div>
                <div>
                  <Label className="text-[color:var(--text-muted)]">Room</Label>
                  <p className="text-white">{selectedBooking.roomName}</p>
                </div>
                <div>
                  <Label className="text-[color:var(--text-muted)]">Players</Label>
                  <p className="text-white">{selectedBooking.players}</p>
                </div>
                <div>
                  <Label className="text-[color:var(--text-muted)]">Date</Label>
                  <p className="text-white">{selectedBooking.date}</p>
                </div>
                <div>
                  <Label className="text-[color:var(--text-muted)]">Time</Label>
                  <p className="text-white">{selectedBooking.timeSlot}</p>
                </div>
              </div>

              <div>
                <Label className="text-[color:var(--text-muted)] text-xs uppercase tracking-wider">Attribution</Label>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div>
                    <span className="text-[color:var(--text-muted)]">Source:</span>
                    <span className="ml-2 text-white">{selectedBooking.utmSource || 'direct'}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Campaign:</span>
                    <span className="ml-2 text-white">{selectedBooking.utmCampaign || '-'}</span>
                  </div>
                  {selectedBooking.fbclid && (
                    <div className="col-span-2 mt-1 pt-1 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[color:var(--text-muted)]">FBCLID:</span>
                      <span className="text-[color:var(--brand-accent)] truncate ml-2 max-w-[200px]">{selectedBooking.fbclid}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-[color:var(--text-muted)]">Internal Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/35"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/15 text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
