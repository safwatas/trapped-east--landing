import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Skull, Calendar, Minus, Plus, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { rooms, timeSlots, getPricePerPerson, calculateTotal } from '../data/mock';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const room = rooms.find(r => r.slug === slug);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [playerCount, setPlayerCount] = useState(room?.minPlayers || 2);
  const [horrorEnabled, setHorrorEnabled] = useState(room?.isHorror || false);
  const [promoCode, setPromoCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const pricePerPerson = useMemo(() => getPricePerPerson(playerCount), [playerCount]);
  const totalPrice = useMemo(() => calculateTotal(playerCount), [playerCount]);

  if (!room) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Room not found</h1>
          <Link to="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlayerChange = (delta) => {
    const newCount = playerCount + delta;
    if (newCount >= room.minPlayers && newCount <= room.maxPlayers) {
      setPlayerCount(newCount);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDate) newErrors.date = 'Please select a date';
    if (!selectedTime) newErrors.time = 'Please select a time slot';
    if (!customerName.trim()) newErrors.name = 'Please enter your name';
    if (!customerPhone.trim()) newErrors.phone = 'Please enter your phone number';
    if (customerPhone && !/^\+?[0-9]{10,14}$/.test(customerPhone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const bookingId = `BK${Date.now()}`;
      navigate(`/confirmation/${bookingId}`, {
        state: {
          room: room.name,
          date: format(selectedDate, 'PPP'),
          time: selectedTime,
          players: playerCount,
          customerName,
          totalPrice
        }
      });
    }, 1500);
  };

  const disabledDays = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
        <Link to={`/rooms/${slug}`} className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to {room.name}
        </Link>
      </div>

      {/* Booking Form */}
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                  Book {room.name}
                </h1>
                <p className="text-[color:var(--text-muted)]">
                  Fill in the details below to reserve your escape room experience.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Select Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start h-12 rounded-xl bg-black/30 border-white/10 text-left font-normal ${
                          selectedDate ? 'text-white' : 'text-white/35'
                        } ${errors.date ? 'border-red-500' : ''}`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[color:var(--bg-elevated)] border-white/10" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={disabledDays}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && <p className="text-sm text-red-400">{errors.date}</p>}
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Select Time Slot *</Label>
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${errors.time ? 'ring-1 ring-red-500 rounded-xl p-1' : ''}`}>
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`h-11 rounded-xl border text-sm font-medium transition-all ${
                          selectedTime === slot
                            ? 'bg-[color:var(--brand-accent)] text-black border-[color:var(--brand-accent)]'
                            : 'bg-black/30 text-white border-white/10 hover:border-white/30'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.time && <p className="text-sm text-red-400">{errors.time}</p>}
                </div>

                {/* Player Count */}
                <div className="space-y-2">
                  <Label className="text-white">Number of Players *</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePlayerChange(-1)}
                      disabled={playerCount <= room.minPlayers}
                      className="h-12 w-12 rounded-xl bg-black/30 border-white/10 text-white disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
                      <span className="font-display text-2xl font-bold text-white">{playerCount}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePlayerChange(1)}
                      disabled={playerCount >= room.maxPlayers}
                      className="h-12 w-12 rounded-xl bg-black/30 border-white/10 text-white disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    This room requires {room.minPlayers}-{room.maxPlayers} players
                  </p>
                </div>

                {/* Horror Toggle */}
                {room.horrorToggleable && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)] border border-white/10">
                    <div className="flex items-center gap-3">
                      <Skull className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="font-medium text-white">Horror Mode</p>
                        <p className="text-xs text-[color:var(--text-muted)]">
                          {horrorEnabled ? 'Horror elements enabled' : 'Horror elements disabled'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={horrorEnabled}
                      onCheckedChange={setHorrorEnabled}
                    />
                  </div>
                )}

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label className="text-white">Promo Code (Optional)</Label>
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35"
                  />
                </div>

                {/* Customer Details */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="font-display font-semibold text-white">Your Details</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Full Name *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Phone Number *</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+20 1XX XXX XXXX"
                      className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Email (Optional)</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 rounded-xl text-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </Button>

                <p className="text-xs text-center text-[color:var(--text-muted)]">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Your booking will be confirmed via phone or WhatsApp
                </p>
              </form>
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg-surface)] to-transparent" />
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{room.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-[color:var(--text-muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {room.minPlayers}-{room.maxPlayers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {room.duration} min
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-muted)]">{playerCount} players × {pricePerPerson} EGP</span>
                      <span className="text-white">{totalPrice} EGP</span>
                    </div>
                    {promoCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[color:var(--text-muted)]">Promo: {promoCode}</span>
                        <span className="text-green-400">Pending</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-[color:var(--text-muted)]">Total</span>
                      <span className="font-display text-2xl font-bold text-[color:var(--brand-accent)]">
                        {totalPrice} EGP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
