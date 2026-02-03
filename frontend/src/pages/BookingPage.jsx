import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, Clock, Skull, Calendar, Minus, Plus, AlertCircle, Loader2, Tag, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { bookingService } from '../lib/bookingService';
import { roomAdapter } from '../lib/adapters';
import { analytics } from '../lib/analytics';
import { calculateBookingQuote, validatePromoCode } from '../lib/pricingEngine';
import { format, isBefore, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const [room, setRoom] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [horrorEnabled, setHorrorEnabled] = useState(false);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoStatus, setPromoStatus] = useState('idle'); // idle, loading, valid, invalid
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Booking quote (pricing)
  const [quote, setQuote] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const dbRoom = await bookingService.getRoomBySlug(slug);
        // Pass current language to adapter for localized content
        const adaptedRoom = roomAdapter(dbRoom, i18n.language);
        setRoom(adaptedRoom);
        setPlayerCount(adaptedRoom.minPlayers);
        setHorrorEnabled(adaptedRoom.isHorror);

        // Track ViewContent/ViewRoom
        analytics.track('ViewRoom', {
          room_id: adaptedRoom.id,
          room_name: adaptedRoom.name,
          language: i18n.language
        });
      } catch (err) {
        console.error(err);
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [slug, i18n.language, t]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !room) return;
      try {
        const booked = await bookingService.getBookedSlots(room.id, format(selectedDate, 'yyyy-MM-dd'));
        const allSlots = await bookingService.getTimeSlots();
        const available = allSlots
          .map(s => s.slot_time)
          .filter(slot => !booked.includes(slot));
        setAvailableSlots(available);
      } catch (err) {
        console.error("Failed to load availability:", err);
      }
    };
    loadSlots();
  }, [selectedDate, room]);

  // Calculate quote whenever relevant values change
  const updateQuote = useCallback(async () => {
    if (!room) return;

    const newQuote = await calculateBookingQuote({
      roomId: room.id,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      timeSlot: selectedTime,
      playerCount,
      pricing: room.pricing,
      promoCode: appliedPromo?.code || null
    });

    setQuote(newQuote);
  }, [room, selectedDate, selectedTime, playerCount, appliedPromo]);

  useEffect(() => {
    updateQuote();
  }, [updateQuote]);

  // Handle promo code application
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError(t('booking.promo.enterCode'));
      setPromoStatus('invalid');
      return;
    }

    setPromoStatus('loading');
    setPromoError('');

    const validation = await validatePromoCode(promoCodeInput, {
      roomId: room?.id,
      playerCount,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
    });

    if (validation.valid) {
      setAppliedPromo(validation.promo);
      setPromoStatus('valid');
      setPromoError('');
      toast.success(t('booking.promo.applied', { code: validation.promo.code }));
    } else {
      setPromoStatus('invalid');
      setPromoError(validation.error);
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoStatus('idle');
    setPromoError('');
  };

  // Use quote values for display
  const pricePerPerson = quote?.basePricePerPerson || 0;
  const totalPrice = quote?.totalPrice || 0;
  const hasDiscount = (quote?.discountAmount || 0) > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[color:var(--brand-accent)] animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('roomDetail.notFound')}</h1>
          <Link to="/rooms">
            <Button className="bg-[color:var(--brand-accent)] text-black">{t('roomDetail.backToRooms')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlayerChange = (delta) => {
    const newCount = playerCount + delta;
    if (newCount >= room.minPlayers && newCount <= room.maxPlayers) {
      setPlayerCount(newCount);
      // Re-validate promo if applied
      if (appliedPromo) {
        setPromoStatus('idle');
        setAppliedPromo(null);
        setPromoCodeInput(appliedPromo.code);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDate) newErrors.date = t('booking.validations.selectDate');
    if (!selectedTime) newErrors.time = t('booking.validations.selectTime');
    if (!customerName.trim()) newErrors.name = t('booking.validations.required');
    if (!customerPhone.trim()) newErrors.phone = t('booking.validations.required');
    if (customerPhone && !/^\+?[0-9]{10,14}$/.test(customerPhone.replace(/\s/g, ''))) {
      newErrors.phone = t('booking.validations.invalidPhone');
    }
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.email = t('booking.validations.invalidEmail');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const bookingData = {
        room_id: room.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        time_slot: selectedTime,
        player_count: playerCount,
        horror_mode: horrorEnabled,
        total_price: quote.totalPrice,
        price_per_person: quote.finalPricePerPerson,
        applied_promo: quote.appliedPromo?.code || null,
        applied_offer_id: quote.appliedOffer?.id || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        status: 'pending',
        language: i18n.language,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_adset: searchParams.get('utm_adset'),
        utm_ad: searchParams.get('utm_ad'),
        fbclid: searchParams.get('fbclid'),
        event_id: uuidv4()
      };

      const result = await bookingService.createBooking(bookingData);

      // Track Lead
      analytics.track('Lead', {
        booking_id: result.id,
        room_name: room.name,
        value: quote.totalPrice,
        players: playerCount,
        event_id: bookingData.event_id
      });

      toast.success(t('booking.success'));
      navigate(`/confirmation/${result.id}`, {
        state: {
          room: room.name,
          date: format(selectedDate, 'PPP'),
          time: selectedTime,
          players: playerCount,
          customerName,
          totalPrice: quote.totalPrice
        }
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || t('booking.error'));

      if (err.message.includes('taken')) {
        setSelectedTime('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
        <Link to={`/rooms/${slug}`} className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors ltr-flex">
          <ArrowLeft className="w-4 h-4" />
          {t('booking.backTo')} {room.name}
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
                  {t('booking.bookRoom')} {room.name}
                </h1>
                <p className="text-[color:var(--text-muted)]">
                  {t('booking.fillDetails')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-white">{t('booking.selectDate')} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start h-12 rounded-xl bg-black/30 border-white/10 text-left font-normal ${selectedDate ? 'text-white' : 'text-white/35'
                          } ${errors.date ? 'border-red-500' : ''}`}
                      >
                        <Calendar className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : t('booking.pickDate')}
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
                  <Label className="text-white">{t('booking.selectTime')} *</Label>
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${errors.time ? 'ring-1 ring-red-500 rounded-xl p-1' : ''}`}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`h-11 rounded-xl border text-sm font-medium transition-all ${selectedTime === slot
                          ? 'bg-[color:var(--brand-accent)] text-black border-[color:var(--brand-accent)]'
                          : 'bg-black/30 text-white border-white/10 hover:border-white/30'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.time && <p className="text-sm text-red-400">{errors.time}</p>}
                  {selectedDate && availableSlots.length === 0 && (
                    <p className="text-sm text-[color:var(--text-muted)]">{t('booking.noSlots')}</p>
                  )}
                </div>

                {/* Player Count */}
                <div className="space-y-2">
                  <Label className="text-white">{t('booking.players')} *</Label>
                  <div className="flex items-center gap-4 ltr-flex">
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
                    {t('booking.roomRequires')} {room.minPlayers}-{room.maxPlayers} {t('rooms.players').toLowerCase()}
                  </p>
                </div>

                {/* Horror Toggle */}
                {room.horrorToggleable && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)] border border-white/10">
                    <div className="flex items-center gap-3 ltr-flex">
                      <Skull className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="font-medium text-white">{t('booking.horrorMode')}</p>
                        <p className="text-xs text-[color:var(--text-muted)]">
                          {horrorEnabled ? t('booking.horrorEnabled') : t('booking.horrorDisabled')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={horrorEnabled}
                      onCheckedChange={setHorrorEnabled}
                    />
                  </div>
                )}

                {/* Promo Code with Apply Button */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 ltr-flex">
                    <Tag className="w-4 h-4" />
                    {t('booking.promo.label')}
                  </Label>

                  {promoStatus === 'valid' && appliedPromo ? (
                    // Applied promo display
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 ltr-flex">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">{appliedPromo.code}</span>
                        <span className="text-green-400/70 text-sm">
                          (-{appliedPromo.discount_type === 'percentage'
                            ? `${appliedPromo.discount_value}%`
                            : `${appliedPromo.discount_value} ${t('common.egp')}`})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="text-green-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    // Promo input
                    <div className="flex gap-2 ltr-flex">
                      <Input
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value.toUpperCase());
                          if (promoStatus !== 'idle') {
                            setPromoStatus('idle');
                            setPromoError('');
                          }
                        }}
                        placeholder={t('booking.promo.placeholder')}
                        className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 flex-1 ${promoStatus === 'invalid' ? 'border-red-500' : ''
                          }`}
                      />
                      <Button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoStatus === 'loading'}
                        className="h-12 px-6 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        {promoStatus === 'loading' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('booking.promo.apply')
                        )}
                      </Button>
                    </div>
                  )}

                  {promoError && (
                    <p className="text-sm text-red-400 flex items-center gap-1 ltr-flex">
                      <AlertCircle className="w-3 h-3" />
                      {promoError}
                    </p>
                  )}
                </div>

                {/* Customer Details */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="font-display font-semibold text-white">{t('booking.yourDetails')}</h3>

                  <div className="space-y-2">
                    <Label className="text-white">{t('booking.fullName')} *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t('booking.namePlaceholder')}
                      className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">{t('booking.phone')} *</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+20 1XX XXX XXXX"
                      className={`h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/35 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">{t('booking.email')}</Label>
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
                  {isSubmitting ? t('booking.submitting') : t('booking.submit')}
                </Button>

                <p className="text-xs text-center text-[color:var(--text-muted)] flex items-center justify-center gap-1 ltr-flex">
                  <AlertCircle className="w-3 h-3" />
                  {t('booking.confirmNote')}
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
                    <div className="flex items-center gap-3 text-sm text-[color:var(--text-muted)] mt-1 ltr-flex">
                      <span className="flex items-center gap-1 ltr-flex">
                        <Users className="w-4 h-4" />
                        {room.minPlayers}-{room.maxPlayers}
                      </span>
                      <span className="flex items-center gap-1 ltr-flex">
                        <Clock className="w-4 h-4" />
                        {room.duration} {t('rooms.minutes')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-muted)]">{playerCount} {t('rooms.players').toLowerCase()} × {pricePerPerson} {t('common.egp')}</span>
                      <span className="text-white">{quote?.baseTotal || pricePerPerson * playerCount} {t('common.egp')}</span>
                    </div>

                    {/* Discount breakdown */}
                    {quote?.discountBreakdown?.map((discount, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-green-400">{discount.name}</span>
                        <span className="text-green-400">-{discount.amount} {t('common.egp')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[color:var(--text-muted)]">{t('booking.total')}</span>
                      <div className="text-right">
                        {hasDiscount && (
                          <span className="text-sm text-[color:var(--text-muted)] line-through ltr:mr-2 rtl:ml-2">
                            {quote?.baseTotal} {t('common.egp')}
                          </span>
                        )}
                        <span className="font-display text-2xl font-bold text-[color:var(--brand-accent)]">
                          {totalPrice} {t('common.egp')}
                        </span>
                      </div>
                    </div>
                    {hasDiscount && (
                      <p className="text-xs text-green-400 text-right mt-1">
                        {t('booking.youSave')} {quote?.discountAmount} {t('common.egp')}!
                      </p>
                    )}
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
